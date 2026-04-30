package com.uoa.planent.dto.user;

import com.uoa.planent.annotation.Trim;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {
    @NotBlank(message = "Missing username")
    @Size(max = 50, message = "Username too long")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must contain latin letters, numbers and underscores.")
    @Trim
    private String username;

    @NotBlank(message = "Missing password")
    @Size(max = 72, message = "Password too long") // bcrypt max password length
    private String password;
}