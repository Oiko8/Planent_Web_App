package com.uoa.planent.service;

import java.util.List;
import java.util.stream.Collectors;

import com.uoa.planent.dto.user.UserDataResponse;
import com.uoa.planent.exception.ResourceNotFoundException;
import jakarta.validation.ValidationException;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uoa.planent.dto.auth.UserRegisterRequest;
import com.uoa.planent.dto.auth.UserRegisterResponse;
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


    @Transactional // override with write to write to database
    public UserRegisterResponse register(UserRegisterRequest request) {
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

        return UserMapper.toRegisterResponse(savedUser);

    }

    public UserDataResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        
        return UserMapper.toDataResponse(user);
    }

    public UserDataResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User with username '" + username + "' not found."));

        return UserMapper.toDataResponse(user);
    }

    public List<UserDataResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(UserMapper::toDataResponse)
            .collect(Collectors.toList());
    } 

    @Transactional
    public UserDataResponse approveUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        user.setIsApproved(true);
        User savedUser = userRepository.save(user);
        return UserMapper.toDataResponse(savedUser);
    }

    @Transactional
    public void rejectUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        userRepository.delete(user);
    }

    @Transactional
    public UserDataResponse updateUser(Integer userId, UserRegisterRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setAddress(request.getAddress());
        user.setZipcode(request.getZipcode());
        user.setAfm(request.getAfm());
        User savedUser = userRepository.save(user);
        return UserMapper.toDataResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        userRepository.delete(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

}
