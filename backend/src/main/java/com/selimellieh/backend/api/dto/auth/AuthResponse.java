package com.selimellieh.backend.api.dto.auth;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String email
) {}

