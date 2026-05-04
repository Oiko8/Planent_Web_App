package com.uoa.planent.service;

import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.mapper.MessageMapper;
import com.uoa.planent.model.User;
import com.uoa.planent.repository.MessageRepository;
import com.uoa.planent.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@AllArgsConstructor
@Service
@Validated // null checks
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;


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
}
