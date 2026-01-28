package com.selimellieh.backend.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
    @NotBlank String refreshToken,
    @NotBlank String email
) {}

