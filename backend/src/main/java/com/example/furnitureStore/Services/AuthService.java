package com.example.furnitureStore.Services;

import jakarta.servlet.http.Cookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.furnitureStore.Configuration.JWTprovider;
import com.example.furnitureStore.DTO.InformationAboutUser;
import com.example.furnitureStore.DTO.JwtRequest;
import com.example.furnitureStore.DTO.JwtResponse;
import com.example.furnitureStore.DTO.RefreshTokenRequest;
import com.example.furnitureStore.DTO.RegistrationUserDTO;
import com.example.furnitureStore.Entities.Role;
import com.example.furnitureStore.Entities.User;

import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class AuthService {
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTprovider jwtProvider;
    // @Autowired
    // private RefreshTokenRequest refreshTokenRequest;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender emailSender;

    public ResponseEntity<?> createAuthToken(@RequestBody JwtRequest authRequest) {
        // проверка существования пользователя
        Optional<User> opuser = userService.findByEmail(authRequest.getEmail());
        if (opuser.isEmpty()) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Пользователь не найден"));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
        } catch (BadCredentialsException e) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Неправильный логин или пароль"));
        }

        User user = opuser.get();
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);
        return ResponseEntity.ok(getInformationAboutUser(accessToken, refreshToken, user));
    }

    public JwtResponse refresh(@NonNull String refreshToken) throws Exception {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String login = claims.getSubject();
            final User user = userService.findByUsername(login).get();
            final String accessToken = jwtProvider.generateAccessToken(user);
            final String newRefreshToken = jwtProvider.generateRefreshToken(user);
            return new JwtResponse(accessToken, newRefreshToken, jwtProvider.getJWTRole(user));
        }
        throw new Exception("Невалидный JWT токен");
    }

    public JwtResponse getAccessToken(@NonNull String refreshToken) {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String login = claims.getSubject();
            final User user = userService.findByUsername(login).get();
            final String accessToken = jwtProvider.generateAccessToken(user);
            return new JwtResponse(accessToken, null, jwtProvider.getJWTRole(user));

        }
        return new JwtResponse(null, null, null);
    }

    @Transactional
    public ResponseEntity<?> createNewUser(@Valid @RequestBody RegistrationUserDTO registrationUserDto) {
        if (!registrationUserDto.getPassword().equals(registrationUserDto.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Пароли не совпадают");
        }

        if (userService.findByUsername(registrationUserDto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "user_exists",
                "message", "Пользователь с указанным email уже существует"
            ));
        }

        User user = userService.createNewUser(registrationUserDto);
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        return ResponseEntity.ok(getInformationAboutUser(accessToken, refreshToken, user));
    }

    private JwtResponse getInformationAboutUser(String tokenAccess, String tokenRefresh, User user) {
        JwtResponse information = new JwtResponse(tokenAccess, tokenRefresh, jwtProvider.getJWTRole(user));
        return information;
    }

    // private InformationAboutUser getInformationAboutUser(User user, String tokenAccess, String tokenRefresh) {
    //     List<Role> roleList = new ArrayList<>(user.getRole());
    //     String role = roleList.get(0).getName();
    //     InformationAboutUser information = new InformationAboutUser(user.getId(), user.getFirstName(),
    //             user.getLastName(), user.getPhoneNumber(), user.getEmail(), tokenAccess, tokenRefresh, role);
    //     JwtResponse information = new JwtResponse(tokenAccess, tokenRefresh)
    //     return information;
    // }

    public ResponseEntity<?> changeProfile(InformationAboutUser userProfile) {

        User user = userService.findByUsername(userProfile.getEmail()).get();
        user.setFirstName(userProfile.getFirstName());
        user.setLastName(userProfile.getLastName());
        String newEmail = userProfile.getEmail();
        Optional<User> checkUser = userService.findByUsername(newEmail);
        if (checkUser.isEmpty() || checkUser.get().getId() == user.getId()) {
            user.setEmail(newEmail);
        }

        User newUser = userService.saveUpdateUser(user);
        List<Role> roleList = new ArrayList<>(newUser.getRole());
        String role = roleList.get(0).getName();
        InformationAboutUser information = new InformationAboutUser(newUser.getId(), newUser.getFirstName(),
                newUser.getLastName(), newUser.getPhoneNumber(), newUser.getEmail(), userProfile.getTokenAccess(),
                userProfile.getTokenRefresh(), role);
        return ResponseEntity.ok(information);
    }

    public ResponseEntity<?> checkValidToken(String token) {
        return ResponseEntity.ok(jwtProvider.validateAccessToken(token));
    }

    public ResponseEntity<?> refreshAccessToken(String refreshToken) {
        try {
            if (!jwtProvider.validateRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid refresh token"));
            }
    
            Claims refreshClaims = jwtProvider.getRefreshClaims(refreshToken);
            String userEmail = refreshClaims.getSubject();
            User user = userService.findByUsername(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    
            String newAccessToken = jwtProvider.generateAccessToken(user);
            String newRefreshToken = jwtProvider.generateRefreshToken(user);
    
            return ResponseEntity.ok()
                    .body(new JwtResponse(newAccessToken, newRefreshToken, jwtProvider.getJWTRole(user)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token refresh failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> recoveryPassword(String email) {
        User user = userService.findByEmail(email).get();
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        String newPassword = generateNewPassword();
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userService.saveUser(user);
        sendNewPasswordByEmail(email, newPassword);

        return new ResponseEntity<>("Password recovery successful", HttpStatus.OK);
    }

    private String generateNewPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder newPassword = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * chars.length());
            newPassword.append(chars.charAt(index));
        }
        return newPassword.toString();
    }

    private void sendNewPasswordByEmail(String email, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Recovery");
        message.setText("Your new password is: " + newPassword);
        emailSender.send(message);
    }

}
