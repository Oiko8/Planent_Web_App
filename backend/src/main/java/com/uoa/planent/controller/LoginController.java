package com.uoa.planent.controller;

import com.uoa.planent.dto.UserLoginRequest;
import com.uoa.planent.dto.UserLoginResponse;
import com.uoa.planent.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final Integer jwtTtl;
    public LoginController(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            @Value("${application.security.jwt-ttl}") Integer jwtTtl) {

        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.jwtTtl = jwtTtl;
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/login")
    public UserLoginResponse login(@RequestBody @Valid UserLoginRequest request) {
        UsernamePasswordAuthenticationToken authToken = UsernamePasswordAuthenticationToken.unauthenticated(request.getUsername(), request.getPassword());
        authenticationManager.authenticate(authToken); // will throw exception if unsuccessful

        // authenticated so send back a jwt token
        String token = jwtUtil.generate(request.getUsername(), jwtTtl);
        return new UserLoginResponse(token, jwtUtil.extractCreatedAt(token), jwtUtil.extractExpirationDate(token));
    }
}
