package com.uoa.planent.controller;

import com.uoa.planent.dto.UserLoginRequest;
import com.uoa.planent.dto.UserLoginResponse;
import com.uoa.planent.dto.UserRegisterRequest;
import com.uoa.planent.dto.UserRegisterResponse;
import com.uoa.planent.security.JwtUtil;
import com.uoa.planent.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final Integer jwtTtl;
    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil, @Value("${application.security.jwt-ttl}") Integer jwtTtl) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.jwtTtl = jwtTtl;
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/login")
    public UserLoginResponse login(@RequestBody @Valid UserLoginRequest request){
        UsernamePasswordAuthenticationToken authToken = UsernamePasswordAuthenticationToken.unauthenticated(request.getUsername(), request.getPassword());
        authenticationManager.authenticate(authToken); // will throw exception if unsuccessful

        // authenticated so send back a jwt token
        String token = jwtUtil.generate(request.getUsername(), jwtTtl);
        return new UserLoginResponse(token, jwtUtil.extractCreatedAt(token), jwtUtil.extractExpirationDate(token));
    }


    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    public UserRegisterResponse register(@RequestBody @Valid UserRegisterRequest request){
        return userService.register(request);
    }
}
