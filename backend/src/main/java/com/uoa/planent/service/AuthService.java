package com.uoa.planent.service;

import com.uoa.planent.dto.auth.UserLoginRequest;
import com.uoa.planent.dto.auth.UserLoginResponse;
import com.uoa.planent.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${application.security.jwt-ttl}")
    private Integer jwtTtl;

    public UserLoginResponse authenticate(UserLoginRequest request) {
        // authenticate
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // generate jwt
        String token = jwtUtil.generate(request.getUsername(), jwtTtl);

        // respond with jwt
        return new UserLoginResponse(token, jwtUtil.extractCreatedAt(token), jwtUtil.extractExpirationDate(token));
    }
}
