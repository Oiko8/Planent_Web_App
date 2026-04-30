package com.uoa.planent.dto.user;

import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.databind.annotation.JsonDeserialize;

@Value
@Builder
@Jacksonized
public class UserUpdateRequest {

    // all fields are optional (nullable) in an update request
    // will update only given fields

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 100, message = "First name too long")
    String firstName;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 100, message = "Last name too long")
    String lastName;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Email(message = "Email not in valid format")
    @Size(max = 100, message = "Email too long")
    String email;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    String phone;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 50, message = "Country too long")
    String country;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 50, message = "City too long")
    String city;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 255, message = "Address too long")
    String address;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 20, message = "Zipcode too long")
    String zipcode;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 9, message = "AFM too long")
    @Pattern(regexp = "^[0-9]{9}$", message = "AFM must contain exactly 9 digits")
    String afm;
}
