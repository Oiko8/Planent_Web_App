package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequest {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String country;
    private String city;
    private String address;
    private String zipcode;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private String afm;
}