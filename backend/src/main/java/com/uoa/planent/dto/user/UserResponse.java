package com.uoa.planent.dto.user;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
public class UserResponse {
    Integer userId;
    String username;
    Boolean isAdmin;
    Boolean isApproved;
    String firstName;
    String lastName;
    String email;
    String phone;
    String country;
    String city;
    String address;
    String zipcode;
    BigDecimal latitude;
    BigDecimal longitude;
    String afm;
}
