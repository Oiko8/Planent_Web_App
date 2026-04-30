package com.uoa.planent.mapper;

import com.uoa.planent.dto.user.UserResponse;
import com.uoa.planent.dto.user.UserRegisterRequest;
import com.uoa.planent.model.User;

public class UserMapper {

    // UserRegisterRequest → User (for registration)
    public static User toModel(UserRegisterRequest request) {
        if (request == null) return null;

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setAddress(request.getAddress());
        user.setZipcode(request.getZipcode());
        user.setAfm(request.getAfm());

        // default for a new user
        user.setIsAdmin(false);
        user.setIsApproved(false);

        return user;
    }


    // User → UserDataResponse (for all of user's data, except sensitive info)
    public static UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .isApproved(user.getIsApproved())
                .isAdmin(user.getIsAdmin())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .country(user.getCountry())
                .city(user.getCity())
                .address(user.getAddress())
                .zipcode(user.getZipcode())
                .longitude(user.getLongitude())
                .latitude(user.getLatitude())
                .afm(user.getAfm())
                .build();
    }
}