package com.uoa.planent.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageSendRequest {
    private Integer receiverId;
    private Integer eventId;
    private String body;
}