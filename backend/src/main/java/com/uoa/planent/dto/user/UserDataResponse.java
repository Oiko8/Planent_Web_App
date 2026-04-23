package com.uoa.planent.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UserDataResponse {
    private Integer userId;
    private String username;
    private Boolean isAdmin;
    private Boolean isApproved;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String country;
    private String city;
    private String address;
    private String zipcode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String afm;
}
