package com.uoa.planent.controller;

import com.uoa.planent.dto.user.UserDataResponse;
import com.uoa.planent.dto.user.UserLoginRequest;
import com.uoa.planent.dto.user.UserLoginResponse;
import com.uoa.planent.dto.user.UserRegisterRequest;
import com.uoa.planent.service.AuthService;
import com.uoa.planent.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService; // for login
    private final UserService userService; // for register

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody @Valid UserLoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDataResponse> register(@RequestBody @Valid UserRegisterRequest request) {
        return new ResponseEntity<>(userService.register(request), HttpStatus.CREATED);
    }
}
