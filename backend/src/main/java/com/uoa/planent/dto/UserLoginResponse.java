package com.uoa.planent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;

@AllArgsConstructor
@Getter
public class UserLoginResponse {
    final String jwtToken;
    final Date createdAt;
    final Date expirationDate;
}
