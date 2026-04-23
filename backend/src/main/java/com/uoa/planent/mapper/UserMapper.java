package com.uoa.planent.mapper;

import com.uoa.planent.dto.user.UserDataResponse;
import com.uoa.planent.dto.user.UserRegisterRequest;
import com.uoa.planent.model.User;

public class UserMapper {

    // UserRegisterRequest → User (for registration)
    public static User toModel(UserRegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // will be encoded in the service
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setAddress(request.getAddress());
        user.setZipcode(request.getZipcode());
        user.setAfm(request.getAfm());
        user.setIsAdmin(false);
        user.setIsApproved(false);
        return user;
    }


    // User → UserDataResponse (for all of user's data, except sensitive info)
    public static UserDataResponse toDataResponse(User user) {
        UserDataResponse response = new UserDataResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setCountry(user.getCountry());
        response.setCity(user.getCity());
        response.setAddress(user.getAddress());
        response.setZipcode(user.getZipcode());
        response.setLongitude(user.getLongitude());
        response.setLatitude(user.getLatitude());
        response.setAfm(user.getAfm());

        return response;
    }
}