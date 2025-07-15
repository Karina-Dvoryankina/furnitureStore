package com.example.furnitureStore.Configuration;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.furnitureStore.Entities.Role;
import com.example.furnitureStore.Entities.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.micrometer.common.lang.NonNull;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JWTprovider {

    private final SecretKey jwtAccessSecret;
    private final SecretKey jwtRefreshSecret;

    public JWTprovider(
            @Value("${jwt.secret.access}") String jwtAccessSecret,
            @Value("${jwt.secret.refresh}") String jwtRefreshSecret) {
        this.jwtAccessSecret = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtAccessSecret));
        this.jwtRefreshSecret = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtRefreshSecret));
    }

    // Генерация Access Token
    public String generateAccessToken(@NonNull User user) {
        final LocalDateTime now = LocalDateTime.now();
        final Instant accessExpirationInstant = now.plusMinutes(1000).atZone(ZoneId.systemDefault()).toInstant();
        final Date accessExpiration = Date.from(accessExpirationInstant);
        
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setExpiration(accessExpiration)
                .signWith(jwtAccessSecret)
                .claim("idUser", user.getId())
                .claim("email", user.getEmail())
                .claim("role", getJWTRole(user))
                .compact();
    }

    public String getJWTRole(User user) {
    return user.getRole()
               .stream()
               .findFirst()
               .map(Role::getName)
               .orElse("USER");
}

    // Генерация Refresh Token
    public String generateRefreshToken(@NonNull User user) {
        final LocalDateTime now = LocalDateTime.now();
        final Instant refreshExpirationInstant = now.plusDays(30).atZone(ZoneId.systemDefault()).toInstant();
        final Date refreshExpiration = Date.from(refreshExpirationInstant);
        
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setExpiration(refreshExpiration)
                .signWith(jwtRefreshSecret)
                .claim("idUser", user.getId())
                .compact(); 
    }

    // Проверка Access Token
    public boolean validateAccessToken(@NonNull String accessToken) {
        return validateToken(accessToken, jwtAccessSecret);
    }

    // Проверка Refresh Token
    public boolean validateRefreshToken(@NonNull String refreshToken) {
        return validateToken(refreshToken, jwtRefreshSecret);
    }

    private boolean validateToken(@NonNull String token, @NonNull Key secret) {
        try {
            Jwts.parser()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException expEx) {
            log.warn("Token expired: {}", expEx.getMessage()); 
        } catch (UnsupportedJwtException unsEx) {
            log.warn("Unsupported token: {}", unsEx.getMessage()); 
        } catch (MalformedJwtException mjEx) {
            log.warn("Malformed token: {}", mjEx.getMessage()); 
        } catch (Exception e) {
            log.warn("Invalid token: {}", e.getMessage()); 
        }
        return false;
    }

    // Получение Claims из Access Token
    public Claims getAccessClaims(@NonNull String token) {
        return getClaims(token, jwtAccessSecret);
    }

    // Получение Claims из Refresh Token
    public Claims getRefreshClaims(@NonNull String token) {
        return getClaims(token, jwtRefreshSecret);
    }

    private Claims getClaims(@NonNull String token, @NonNull Key secret) {
        return Jwts.parser()
                .setSigningKey(secret)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}