package com.uoa.planent.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;

@AllArgsConstructor
@Getter
public class UserLoginResponse {
    private final String jwtToken;
    private final Date createdAt;
    private final Date expirationDate;
}
