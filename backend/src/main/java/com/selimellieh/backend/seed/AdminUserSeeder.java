package com.selimellieh.backend.seed;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.selimellieh.backend.entity.Role;
import com.selimellieh.backend.entity.User;
import com.selimellieh.backend.repository.UserRepository;

@Component
public class AdminUserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public AdminUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedAdminUser() {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            return;
        }

        User adminUser = new User(adminEmail, passwordEncoder.encode(adminPassword), Role.ADMIN);
        try {
            userRepository.save(adminUser);
        } catch (DataIntegrityViolationException ignored) {
            // Ignore if the admin user already exists
        }
    }
}
