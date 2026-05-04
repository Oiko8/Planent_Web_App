package com.uoa.planent.mapper;

import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.model.Message;
import com.uoa.planent.model.User;

public class MessageMapper {
    public static MessagePreviewResponse toPreviewResponse(Message message, User otherUser){
        if (message == null || otherUser == null) return null;

        return MessagePreviewResponse.builder()
                .messageId(message.getId())
                .otherUser(UserMapper.toPublicInfo(otherUser))
                .bodyPreview(message.getBody().length() > 50 ? message.getBody().substring(0, 50) + "..." : message.getBody())
                .isRead(message.getIsRead())
                .build();
    }
}
