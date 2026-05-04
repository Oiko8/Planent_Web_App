package com.uoa.planent.dto.user;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class UserPublicInfo {
    Integer userId;
    String username;
    String firstName;
    String lastName;
    String email;
    String country;
    String city;
}
