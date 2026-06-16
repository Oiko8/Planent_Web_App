package com.uoa.planent.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

// handles generation, validation and reading of JSON web tokens (JWTs)
@AllArgsConstructor
public class JwtUtil {

    private final SecretKey secretKey;

    // jwt token has:
    // username
    // userId
    // isAdmin (role)
    public String generate(UserDetailsImpl userDetails, Integer ttlInMs) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userId", userDetails.getId())
                .claim("isAdmin", userDetails.isAdmin())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ttlInMs))
                .signWith(secretKey)
                .compact();
    }

    public UserDetailsImpl extractUserDetails(String jwtToken) throws JwtException {
        Claims claims = extractAllClaims(jwtToken);

        String username = claims.getSubject();
        Integer userId = claims.get("userId", Integer.class);
        Boolean isAdmin = claims.get("isAdmin", Boolean.class);
        List<SimpleGrantedAuthority> authorities = (isAdmin != null && isAdmin) ? List.of(new SimpleGrantedAuthority(UserDetailsImpl.ADMIN_ROLE)) : List.of(new SimpleGrantedAuthority(UserDetailsImpl.USER_ROLE));

        return UserDetailsImpl.builder()
                .id(userId)
                .username(username)
                .authorities(authorities)
                .isApproved(true) // if token is valid -> automatically an approved user
                .build();
    }

    public Date extractExpirationDate(String jwtToken) throws JwtException {
        return extractClaim(jwtToken, Claims::getExpiration);
    }

    public Date extractCreatedAt(String jwtToken) throws JwtException {
        return extractClaim(jwtToken, Claims::getIssuedAt);
    }

    private <T> T extractClaim(String jwtToken, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = extractAllClaims(jwtToken);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String jwtToken) throws JwtException {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(jwtToken)
                .getPayload();
    }


}
