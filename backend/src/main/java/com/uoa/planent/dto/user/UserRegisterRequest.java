package com.uoa.planent.dto.user;


import com.uoa.planent.annotation.Trim;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequest {
    @NotBlank(message = "Missing username")
    @Size(max = 50, message = "Username too long")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must contain latin letters, numbers and underscores.")
    @Trim
    private String username;

    @NotBlank(message = "Missing password")
    @Size(max = 72, message = "Password too long")
    private String password;

    @NotBlank(message = "Missing first name")
    @Size(max = 100, message = "First name too long")
    @Trim
    private String firstName;

    @NotBlank(message = "Missing last name")
    @Size(max = 100, message = "Last name too long")
    @Trim
    private String lastName;

    @NotBlank(message = "Missing email")
    @Email(message = "Email not in valid format")
    @Size(max = 100, message = "Email too long")
    @Trim
    private String email;

    @NotBlank(message = "Missing phone number")
    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    @Trim
    private String phone;

    @NotBlank(message = "Missing country")
    @Size(max = 50, message = "Country too long")
    @Trim
    private String country;

    @NotBlank(message = "Missing city")
    @Size(max = 50, message = "City too long")
    @Trim
    private String city;

    @NotBlank(message = "Missing address")
    @Size(max = 255, message = "Address too long")
    @Trim
    private String address;

    @NotBlank(message = "Missing zipcode")
    @Size(max = 20, message = "Zipcode too long")
    @Trim
    private String zipcode;

    @NotBlank(message = "Missing AFM")
    @Size(max = 9, message = "AFM too long")
    @Pattern(regexp = "^[0-9]{9}$", message = "AFM must contain exactly 9 digits")
    @Trim
    private String afm;
}