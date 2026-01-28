package com.selimellieh.backend.api;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.selimellieh.backend.entity.User;
import com.selimellieh.backend.repository.UserRepository;

/**
 * Minimal user API.
 *
 * - Exposes a `/api/user/me` route.
 * - Looks up the user by the authenticated principal's name (email).
 * - Returns basic info (email, role).
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        // Until security is wired, principal may be null.
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Unauthorized - no authenticated user")
            );
        }

        User user = userRepository.findByEmail(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "User not found")
            );
        }

        return ResponseEntity.ok(
            Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name()
            )
        );
    }
}

