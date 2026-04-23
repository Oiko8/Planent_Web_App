package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterResponse {
    private String message;
    private Integer userId;
    private String username;
}