package com.uoa.planent.dto.message;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.uoa.planent.dto.user.UserPublicInfo;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class MessagePreviewResponse {
    Integer messageId;
    Integer eventId;
    String eventTitle;
    UserPublicInfo otherUser;
    String bodyPreview;
    @JsonProperty("isRead")
    boolean isRead;
}
