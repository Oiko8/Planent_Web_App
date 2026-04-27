package com.uoa.planent.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import com.uoa.planent.dto.user.UserResponse;
import com.uoa.planent.dto.user.UserUpdateRequest;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.security.UserDetailsImpl;
import jakarta.validation.ValidationException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uoa.planent.dto.user.UserRegisterRequest;
import com.uoa.planent.model.User;
import com.uoa.planent.mapper.UserMapper;
import com.uoa.planent.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
@Transactional(readOnly = true) // concurrency in data (by default all methods are reading only from the database)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // checks if the given userId matches the one of the signed user (user)
    // or if signed in user is an admin
    public boolean isUserOwnerOrAdmin(Integer userId, UserDetailsImpl user) {
        boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> Objects.equals(a.getAuthority(), "ADMIN"));
        boolean isSelf = user.getId().equals(userId);

        return isAdmin || isSelf;
    }


    @Transactional // override with write to write to database
    public UserResponse registerUser(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists.");
        }

        // The user is ok to be created
        // Μap it to a model User and save to database
        User user = UserMapper.toModel(request);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // encrypt password
        User savedUser = userRepository.save(user);

        return UserMapper.toDataResponse(savedUser);

    }

    public UserResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        
        return UserMapper.toDataResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User with username '" + username + "' not found."));

        return UserMapper.toDataResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(UserMapper::toDataResponse)
            .collect(Collectors.toList());
    } 

    @Transactional
    public UserResponse approveUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        user.setIsApproved(true);
        User savedUser = userRepository.save(user);
        return UserMapper.toDataResponse(savedUser);
    }

    @Transactional
    public void rejectUser(Integer userId) {
        deleteUser(userId);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        // update only the non-null (given) fields
        Optional.ofNullable(request.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(request.getLastName()).ifPresent(user::setLastName);
        Optional.ofNullable(request.getEmail()).ifPresent(user::setEmail);
        Optional.ofNullable(request.getPhone()).ifPresent(user::setPhone);
        Optional.ofNullable(request.getCountry()).ifPresent(user::setCountry);
        Optional.ofNullable(request.getCity()).ifPresent(user::setCity);
        Optional.ofNullable(request.getAddress()).ifPresent(user::setAddress);
        Optional.ofNullable(request.getZipcode()).ifPresent(user::setZipcode);
        Optional.ofNullable(request.getAfm()).ifPresent(user::setAfm);

        User savedUser = userRepository.save(user);
        return UserMapper.toDataResponse(savedUser);
    }

}
