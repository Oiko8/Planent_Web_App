package com.uoa.planent.dto;


import com.uoa.planent.dto.auth.UserRegisterResponse;
import lombok.Getter;
import lombok.Setter;
// import java.time.LocalDateTime;

@Getter
@Setter
public class MessageResponse {
    private Integer messageId;
    private UserRegisterResponse sender;
    private UserRegisterResponse receiver;
    private Integer eventId;
    private String body;
    private boolean isRead;
    private boolean deletedBySender;
    private boolean deletedByReceiver;
}