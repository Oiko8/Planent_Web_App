package com.uoa.planent.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class BroadcastMessageRequest {

    @NotBlank(message = "Missing message body")
    @Size(max = 20000, message = "Message body too long")
    String body;
}