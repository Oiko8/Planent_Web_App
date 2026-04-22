package com.uoa.planent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
// import lombok.Setter;

@AllArgsConstructor
@Getter
public class UserLoginRequest {
    final String username;
    final String password;
}