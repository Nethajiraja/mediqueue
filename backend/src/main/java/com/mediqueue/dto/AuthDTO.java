package com.mediqueue.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Full Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email address required")
        private String email;

        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Confirm Password is required")
        private String confirmPassword;

        private String role = "PATIENT";
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email address required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String message;
        private Object user;

        public AuthResponse(String token, String message, Object user) {
            this.token = token;
            this.message = message;
            this.user = user;
        }
    }
}
