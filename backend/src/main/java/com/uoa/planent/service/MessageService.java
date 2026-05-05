package com.uoa.planent.service;

import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.dto.message.MessageResponse;
import com.uoa.planent.dto.message.MessageSendRequest;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.MessageMapper;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.Message;
import com.uoa.planent.model.User;
import com.uoa.planent.repository.BookingRepository;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.MessageRepository;
import com.uoa.planent.repository.UserRepository;
import com.uoa.planent.security.UserDetailsImpl;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@AllArgsConstructor
@Service
@Validated // null checks
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    // ----- helper methods -----

    public boolean isSender(@NotNull Message message, @NotNull Integer currentUserId) {
        return Objects.equals(message.getSender().getId(), currentUserId);
    }

    public boolean isReceiver(@NotNull Message message, @NotNull Integer currentUserId) {
        return Objects.equals(message.getReceiver().getId(), currentUserId);
    }

    public boolean isSenderOrReceiver(@NotNull Integer messageId, UserDetailsImpl user) {
        if (user == null) return false; // access denied exception by default if false

        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Message with ID '" + messageId + "' not found."));

        return isSender(message, user.getId()) || isReceiver(message, user.getId());
    }


    public boolean canSendMessage(Integer eventId, Integer senderId, Integer receiverId){
        if (eventId == null || senderId == null || receiverId == null) return false;

        // cant send message to self
        if (senderId.equals(receiverId)) {
            return false;
        }


        // check if the receiver is the organizer to the event that the sender is an attendee
        // or vice versa
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return false; // event doesnt exist -> 403 forbidden
        }
        Integer organizerId = event.getOrganizer().getId();


        // sender is organizer
        if (senderId.equals(organizerId)) {
            return hasBooking(eventId, receiverId); // receiver must have a booking on this event
        }

        // receiver is organizer
        if (receiverId.equals(organizerId)) {
            return hasBooking(eventId, senderId); // sender must have a booking on this event
        }

        // everything else forbidden
        return false;
    }

    private boolean hasBooking(Integer eventId, Integer userId) {
        // user has a booking on a ticket type for the given event
        return bookingRepository.existsByTicketType_Event_IdAndAttendee_Id(eventId, userId);
    }





    // ----- main methods -----

    public Page<MessagePreviewResponse> getInboxMessages(@NotNull Integer currentUserId, Pageable pageable) {
        return messageRepository.findByReceiverIdAndDeletedByReceiverFalse(currentUserId, pageable).map(
                message -> {
                    User otherUser = message.getSender(); // inbox (sender -> current user)
                    return MessageMapper.toPreviewResponse(message, otherUser);
                });
    }

    public Page<MessagePreviewResponse> getSentMessages(@NotNull Integer currentUserId, Pageable pageable) {
        return messageRepository.findBySenderIdAndDeletedBySenderFalse(currentUserId, pageable)
                .map(message -> {
                    User otherUser = message.getReceiver(); // sent (current user -> receiver)
                    return MessageMapper.toPreviewResponse(message, otherUser);
                });
    }

    @Transactional
    public MessageResponse getMessageById(@NotNull Integer messageId, @NotNull Integer currentUserId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Message with ID '" + messageId + "' not found."));

        // mark read only if the receiver is reading it
        if (!message.getIsRead() && isReceiver(message, currentUserId)) {
            message.setIsRead(true);
            message = messageRepository.save(message);
        }

        // get other user
        // this method is called only by preauthorizing that the current user is either the sender or receiver
        User otherUser;
        if (isSender(message, currentUserId)) {
            otherUser = message.getReceiver();
        } else { // current user is the receiver
            otherUser = message.getSender();
        }

        return MessageMapper.toResponse(message, otherUser);
    }


    @Transactional
    public MessageResponse sendMessage(MessageSendRequest request, @NotNull Integer senderId) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new ResourceNotFoundException("Sender with ID '" + senderId + "' not found."));
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow(() -> new ResourceNotFoundException("Receiving user with ID '" + request.getReceiverId() + "' not found."));
        Event event = eventRepository.findById(request.getEventId()).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + request.getEventId() + "' not found."));

        Message message = Message.builder()
                .event(event)
                .body(request.getBody())
                .sender(sender)
                .receiver(receiver)
                .isRead(false)
                .deletedBySender(false)
                .deletedByReceiver(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        return MessageMapper.toResponse(savedMessage, receiver);
    }


    @Transactional
    public void sendBulkMessages(@NotNull Event event, @NotNull User sender, Set<User> receivers, @NotNull String body) {
        if (receivers == null || receivers.isEmpty()) {
            return; // no receivers -> dont send anything
        }

        List<Message> messages = receivers.stream().map(receiver ->
                Message.builder()
                        .event(event)
                        .sender(sender)
                        .receiver(receiver)
                        .body(body)
                        .isRead(false)
                        .deletedBySender(false)
                        .deletedByReceiver(false)
                        .build()
        ).toList();

        messageRepository.saveAll(messages);
    }


    @Transactional
    public void deleteMessage(@NotNull Integer messageId, @NotNull Integer currentUserId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Message with ID '" + messageId + "' not found."));

        if (isSender(message, currentUserId) && !message.getDeletedBySender()) {
            message.setDeletedBySender(true);
            messageRepository.save(message);
        }else if (isReceiver(message, currentUserId) && !message.getDeletedByReceiver()) {
            message.setDeletedByReceiver(true);
            messageRepository.save(message);
        }

        // if both deleted then delete it permanently from the database
        if (message.getDeletedBySender() && message.getDeletedByReceiver()) {
            messageRepository.delete(message);
        }
    }
}
