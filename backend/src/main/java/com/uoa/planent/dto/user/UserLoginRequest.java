package com.uoa.planent.dto.user;

import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.databind.annotation.JsonDeserialize;

@Value
@Builder
@Jacksonized
public class UserLoginRequest {
    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing username")
    @Size(max = 50, message = "Username too long")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must contain latin letters, numbers and underscores.")
    String username;

    @NotBlank(message = "Missing password")
    @Size(max = 72, message = "Password too long") // bcrypt max password length
    String password;
}