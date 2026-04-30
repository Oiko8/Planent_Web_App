package com.uoa.planent.dto.user;

import com.uoa.planent.annotation.Trim;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    // all fields are optional (nullable) in an update request
    // will update only given fields

    @Size(max = 100, message = "First name too long")
    @Trim
    private String firstName;

    @Size(max = 100, message = "Last name too long")
    @Trim
    private String lastName;

    @Email(message = "Email not in valid format")
    @Size(max = 100, message = "Email too long")
    @Trim
    private String email;

    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    @Trim
    private String phone;

    @Size(max = 50, message = "Country too long")
    @Trim
    private String country;

    @Size(max = 50, message = "City too long")
    @Trim
    private String city;

    @Size(max = 255, message = "Address too long")
    @Trim
    private String address;

    @Size(max = 20, message = "Zipcode too long")
    @Trim
    private String zipcode;

    @Size(max = 9, message = "AFM too long")
    @Pattern(regexp = "^[0-9]{9}$", message = "AFM must contain exactly 9 digits")
    @Trim
    private String afm;
}
