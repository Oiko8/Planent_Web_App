package com.uoa.planent.service;

import com.uoa.planent.dto.user.UserLoginRequest;
import com.uoa.planent.dto.user.UserLoginResponse;
import com.uoa.planent.security.JwtUtil;
import com.uoa.planent.security.UserDetailsImpl;
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
        var authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) { // get userdetails from security context (principal)
            throw new IllegalStateException("Authentication principal is missing or invalid.");
        }

        // authenticated -> generate jwt
        String token = jwtUtil.generate(userDetails, jwtTtl);

        // respond with jwt
        return UserLoginResponse.builder()
                .jwtToken(token)
                .createdAt(jwtUtil.extractCreatedAt(token))
                .expirationDate(jwtUtil.extractExpirationDate(token))
                .build();
    }
}
