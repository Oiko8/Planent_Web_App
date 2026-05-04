package com.uoa.planent.dto.message;


import com.uoa.planent.dto.user.UserPublicInfo;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageResponse {
    Integer messageId;
    UserPublicInfo otherUser;
    String fullBody;
}