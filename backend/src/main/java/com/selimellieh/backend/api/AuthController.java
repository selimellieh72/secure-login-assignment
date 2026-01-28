package com.selimellieh.backend.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.selimellieh.backend.api.dto.auth.AuthResponse;
import com.selimellieh.backend.api.dto.auth.LoginRequest;
import com.selimellieh.backend.api.dto.auth.RefreshRequest;
import com.selimellieh.backend.api.dto.common.ErrorResponse;
import com.selimellieh.backend.entity.User;
import com.selimellieh.backend.repository.UserRepository;
import com.selimellieh.backend.security.JwtUtil;

import jakarta.validation.Valid;

/**
 * Minimal auth controller exposing login, refresh, and logout routes.
 *
 * This uses JWTs but does NOT yet wire full Spring Security.
 * The frontend can:
 * - POST /api/auth/login  -> get access + refresh tokens
 * - POST /api/auth/refresh -> get a new access token using a refresh token
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email());
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid email or password"));
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(
            new AuthResponse(
                accessToken,
                refreshToken,
                user.getEmail()
            )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest request) {
        String token = request.refreshToken();

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid or expired refresh token"));
        }

        String email = jwtUtil.getEmailFromToken(token);
        if (!email.equals(request.email())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                // a non-accurate error message to prevent attackers from guessing the email
                .body(new ErrorResponse("Invalid or expired refresh token"));
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("User no longer exists"));
        }
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Refresh token is no longer valid"));
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(
            new AuthResponse(
                newAccessToken,
                newRefreshToken,
                user.getEmail()
            )
        );
    }

}

