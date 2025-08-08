package com.scutelnic.faina.Controller;

import com.scutelnic.faina.service.UserService;
import com.scutelnic.faina.dto.LoginRequest;
import com.scutelnic.faina.dto.RegisterRequest;
import com.scutelnic.faina.dto.AuthResponse;
import com.scutelnic.faina.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        AuthResponse response = userService.login(loginRequest);
        if (response.isSuccess()) {
            // Store user in session
            session.setAttribute("user", response.getUser());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("phone") String phone,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            HttpSession session) {
        
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(email);
        registerRequest.setPassword(password);
        registerRequest.setFirstName(firstName);
        registerRequest.setLastName(lastName);
        registerRequest.setPhone(phone);
        
        // Handle profile image upload
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String fileName = saveProfileImage(profileImage);
                registerRequest.setProfileImage(fileName);
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(new AuthResponse(false, "Eroare la încărcarea imaginii"));
            }
        }
        
        AuthResponse response = userService.register(registerRequest);
        if (response.isSuccess()) {
            // Store user in session after registration
            session.setAttribute("user", response.getUser());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private String saveProfileImage(MultipartFile file) throws IOException {
        // Create uploads directory if it doesn't exist
        String uploadDir = "uploads/profile-images/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        return fileName;
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new AuthResponse(true, "Deconectare reușită"));
    }

    @GetMapping("/user")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
