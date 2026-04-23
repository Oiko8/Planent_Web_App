package com.uoa.planent.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    // all fields are optional in an update request
    // will update only given fields

    @Size(max = 100, message = "First name too long")
    private String firstName;

    @Size(max = 100, message = "Last name too long")
    private String lastName;

    @Email(message = "Email not in valid format")
    @Size(max = 100, message = "Email too long")
    private String email;

    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    private String phone;

    @Size(max = 50, message = "Country too long")
    private String country;

    @Size(max = 50, message = "City too long")
    private String city;

    @Size(max = 255, message = "Address too long")
    private String address;

    @Size(max = 20, message = "Zipcode too long")
    private String zipcode;

    @Size(max = 9, message = "AFM too long")
    @Pattern(regexp = "^[0-9]{9}$", message = "AFM must contain exactly 9 digits")
    private String afm;
}
