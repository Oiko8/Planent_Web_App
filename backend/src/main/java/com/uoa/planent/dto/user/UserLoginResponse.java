package com.uoa.planent.dto.user;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.Date;

@Value
@Builder
@Jacksonized
public class UserLoginResponse {
    String jwtToken;
    Date createdAt;
    Date expirationDate;
}
