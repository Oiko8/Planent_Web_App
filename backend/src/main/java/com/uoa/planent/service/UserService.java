package com.uoa.planent.service;

import com.uoa.planent.dto.UserRegisterRequest;
import com.uoa.planent.dto.UserResponse;

import java.util.List;

public interface UserService {

    // register
    UserResponse register(UserRegisterRequest request);

    // get uder by id
    UserResponse getUserById(Integer userId);

    // get user by username
    UserResponse getUserByUsername(String username);

    // get all users (available for admin)
    List<UserResponse> getAllUsers();

    // approve a user (available for admin)
    UserResponse approveUser(Integer userId);
    // ?? maybe by username better and not sure if it is userResponse
    // or UserRegisterRequest ??

    // reject user (available for admin)
    void rejectUser(Integer userId);

    // update user profile
    UserResponse updateUser(Integer userId, UserRegisterRequest request);

    // Delete user (available for admin)
    void deleteUser(Integer userId);

    // Check if username already exists
    boolean existsByUsername(String username);

}
