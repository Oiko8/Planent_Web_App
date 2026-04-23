package com.uoa.planent.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserLoginRequest {
    @NotBlank(message = "Missing username")
    @Size(max = 50, message = "Username too long")
    private final String username;

    @NotBlank(message = "Missing password")
    @Size(max = 72, message = "Password too long") // bcrypt max password length
    private final String password;
}