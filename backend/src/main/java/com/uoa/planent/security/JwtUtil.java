package com.uoa.planent.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

// handles generation, validation and reading of JSON web tokens (JWTs)
@AllArgsConstructor
public class JwtUtil {

    private final SecretKey secretKey;

    public String generate(String username, Integer ttlInMs) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ttlInMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) throws JwtException {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpirationDate(String token) throws JwtException {
        return extractClaim(token, Claims::getExpiration);
    }

    public Date extractCreatedAt(String token) throws JwtException {
        return extractClaim(token, Claims::getIssuedAt);
    }

    public boolean isTokenValid(String token, String username){
        return !isTokenExpired(token) && extractUsername(token).equals(username);
    }

    private boolean isTokenExpired(String token) throws JwtException {
        return extractExpirationDate(token).before(new Date());
    }

    // helper methods to extract any specific piece of data (Claim) from the token
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = extractClaim(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractClaim(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
