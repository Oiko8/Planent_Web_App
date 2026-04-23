package com.uoa.planent.dto.auth;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterResponse {
    private String message;
    private Integer userId;
    private String username;
}