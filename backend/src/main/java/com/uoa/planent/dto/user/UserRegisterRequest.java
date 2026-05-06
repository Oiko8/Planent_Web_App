package com.uoa.planent.dto.user;


import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
public class UserRegisterRequest {
    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing username")
    @Size(max = 50, message = "Username too long")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must contain latin letters, numbers and underscores.")
    String username;

    @NotBlank(message = "Missing password")
    @Size(max = 72, message = "Password too long")
    String password;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing first name")
    @Size(max = 100, message = "First name too long")
    String firstName;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing last name")
    @Size(max = 100, message = "Last name too long")
    String lastName;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing email")
    @Email(message = "Email not in valid format")
    @Size(max = 100, message = "Email too long")
    String email;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing phone number")
    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    String phone;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing country")
    @Size(max = 50, message = "Country too long")
    String country;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing city")
    @Size(max = 50, message = "City too long")
    String city;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing address")
    @Size(max = 255, message = "Address too long")
    String address;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing zipcode")
    @Size(max = 20, message = "Zipcode too long")
    String zipcode;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing AFM")
    @Size(max = 9, message = "AFM too long")
    @Pattern(regexp = "^[0-9]{9}$", message = "AFM must contain exactly 9 digits")
    String afm;

    @Nullable
    @Digits(integer = 2, fraction = 8, message = "Latitude must contain up to 2 integer and 8 decimal digits")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    BigDecimal latitude;

    @Nullable
    @Digits(integer = 3, fraction = 8, message = "Longitude must contain up to 3 integer and 8 decimal digits")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    BigDecimal longitude;

}