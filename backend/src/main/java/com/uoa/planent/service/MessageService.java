package com.uoa.planent.service;

import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.dto.message.MessageResponse;
import com.uoa.planent.dto.message.MessageSendRequest;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.MessageMapper;
import com.uoa.planent.model.Booking;
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
import java.util.stream.Collectors;

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

    private boolean isSender(@NotNull Message message, @NotNull Integer currentUserId) {
        return Objects.equals(message.getSender().getId(), currentUserId);
    }

    private boolean isReceiver(@NotNull Message message, @NotNull Integer currentUserId) {
        return Objects.equals(message.getReceiver().getId(), currentUserId);
    }

    public boolean isSenderOrReceiver(@NotNull Integer messageId, @NotNull Integer currentUserId) {
        return messageRepository.existsByIdAndSenderOrReceiver(messageId, currentUserId);
    }


    public boolean canSendMessage(Integer eventId, Integer senderId, Integer receiverId){
        if (eventId == null || senderId == null || receiverId == null) return false;

        // cannot send to self
        if (senderId.equals(receiverId)) {
            return false;
        }

        // allow only organizer -> attendee or attendee -> organizer
        Integer organizerId = eventRepository.findOrganizerIdById(eventId).orElse(null);
        if (organizerId == null) return false;

        if (senderId.equals(organizerId)) {
            return hasBooking(eventId, receiverId);
        }

        if (receiverId.equals(organizerId)) {
            return hasBooking(eventId, senderId);
        }

        return false;
    }

    private boolean hasBooking(Integer eventId, Integer userId) {
        return bookingRepository.existsByTicketType_Event_IdAndAttendee_Id(eventId, userId);
    }





    // ----- main methods -----

    public Page<MessagePreviewResponse> getInboxMessages(@NotNull Integer currentUserId, Pageable pageable) {
        // Repository method's OrderByIdDesc gives us newest-first by default
        return messageRepository.findInboxWithRelations(currentUserId, pageable).map(
                message -> {
                    User otherUser = message.getSender();
                    return MessageMapper.toPreviewResponse(message, otherUser, false);
                });
    }

    public Page<MessagePreviewResponse> getSentMessages(@NotNull Integer currentUserId, Pageable pageable) {
        return messageRepository.findSentWithRelations(currentUserId, pageable)
                .map(message -> {
                    User otherUser = message.getReceiver();
                    return MessageMapper.toPreviewResponse(message, otherUser, true);
                });
    }

    public long getUnreadCount(@NotNull Integer currentUserId) {
        return messageRepository.countByReceiverIdAndIsReadFalseAndDeletedByReceiverFalse(currentUserId);
    }

    public MessageResponse getMessageById(@NotNull Integer messageId, @NotNull Integer currentUserId) {
        Message message = messageRepository.findByIdWithRelations(messageId).orElseThrow(() -> new ResourceNotFoundException("Message with ID '" + messageId + "' not found."));

        User otherUser;
        if (isSender(message, currentUserId)) {
            otherUser = message.getReceiver();
        } else {
            otherUser = message.getSender();
        }

        return MessageMapper.toResponse(message, otherUser, isSender(message, currentUserId));
    }

    @Transactional
    public void markMessageAsRead(@NotNull Integer messageId, @NotNull Integer currentUserId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Message with ID '" + messageId + "' not found."));

        // mark read only by the receiver
        if (!message.getIsRead() && message.getReceiver().getId().equals(currentUserId)) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    @Transactional
    public MessageResponse sendMessage(MessageSendRequest request, @NotNull Integer senderId) {
        User sender = userRepository.getReferenceById(senderId); // reference of sender since we just need it for foreign key matching
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
        return MessageMapper.toResponse(savedMessage, receiver, true);
    }



    @Transactional
    public void sendBulkMessages(@NotNull Event event, @NotNull User sender, Set<User> receivers, @NotNull String body) {
        if (receivers == null || receivers.isEmpty()) {
            return;
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


    // Organizer (or admin) broadcasts a message to all active attendees of an event.
    // The sender is excluded from the recipient set (you don't message yourself).
    // Reuses the existing sendBulkMessages — no new persistence code.
    @Transactional
    public int broadcastToEventAttendees(@NotNull Integer eventId, @NotNull Integer senderId, @NotNull String body) {
        User sender = userRepository.getReferenceById(senderId); // reference of sender since we just need it for foreign key matching
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        // Only active (non-cancelled) bookings — cancelled attendees shouldn't get more updates
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByEventId(eventId);

        // Distinct attendees, excluding the sender themselves
        Set<User> recipients = activeBookings.stream()
                .map(Booking::getAttendee)
                .filter(a -> !a.getId().equals(senderId))
                .collect(Collectors.toSet());

        sendBulkMessages(event, sender, recipients, body);
        return recipients.size();
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

        if (message.getDeletedBySender() && message.getDeletedByReceiver()) {
            messageRepository.delete(message);
        }
    }
}