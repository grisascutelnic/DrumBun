package com.scutelnic.faina.dto;

import lombok.Data;
import com.scutelnic.faina.entity.User;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private User user;
    private String token; // For future JWT implementation
    
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public AuthResponse(boolean success, String message, User user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }
}
