package com.uoa.planent.dto.message;


import com.uoa.planent.dto.user.UserPublicInfo;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class MessageResponse {
    Integer messageId;
    Integer eventId;
    String eventTitle;
    UserPublicInfo otherUser;
    String body;
}