package com.uoa.planent.service;

import java.util.List;
import java.util.stream.Collectors;

import com.uoa.planent.dto.UserDataResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uoa.planent.dto.UserRegisterRequest;
import com.uoa.planent.dto.UserRegisterResponse;
import com.uoa.planent.model.User;
import com.uoa.planent.mapper.UserMapper;
import com.uoa.planent.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserRegisterResponse register(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists.");
        }

        // The user it is ok to be created
        // map it to a model "User" and save to database
        User user = UserMapper.toModel(request);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // encrypt password
        User savedUser = userRepository.save(user);

        return UserMapper.toRegisterResponse(savedUser);

    }

    public UserDataResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserMapper.toDataResponse(user);
    }

    public UserDataResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(()->new RuntimeException("User not found"));

        return UserMapper.toDataResponse(user);
    }

    public List<UserDataResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(UserMapper::toDataResponse)
            .collect(Collectors.toList());
    } 

    public UserDataResponse approveUser(Integer userId) {
                User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsApproved(true);
        User savedUser = userRepository.save(user);
        return UserMapper.toDataResponse(savedUser);
    }

    public void rejectUser(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    public UserDataResponse updateUser(Integer userId, UserRegisterRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
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

    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

}
