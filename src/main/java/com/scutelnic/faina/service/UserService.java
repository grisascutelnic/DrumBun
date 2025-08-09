package com.scutelnic.faina.service;

import com.scutelnic.faina.entity.User;
import com.scutelnic.faina.repository.UserRepository;
import com.scutelnic.faina.dto.LoginRequest;
import com.scutelnic.faina.dto.RegisterRequest;
import com.scutelnic.faina.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email);
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Utilizatorul cu acest email există deja");
        }
        return userRepository.save(user);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    public User updateProfile(Long userId, String firstName, String lastName, String email, 
                            String phone, String currentPassword, String newPassword, 
                            MultipartFile profileImage) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        
        // Verificăm dacă email-ul nou nu este folosit de alt utilizator
        if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Un utilizator cu acest email există deja");
        }
        
        // Actualizăm informațiile de bază
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone(phone);
        
        // Verificăm schimbarea parolei
        if (newPassword != null && !newPassword.isEmpty()) {
            if (currentPassword == null || currentPassword.isEmpty()) {
                throw new RuntimeException("Parola actuală este obligatorie pentru a schimba parola");
            }
            
            if (!Objects.equals(user.getPassword(), currentPassword)) {
                throw new RuntimeException("Parola actuală este incorectă");
            }
            
            if (newPassword.length() < 6) {
                throw new RuntimeException("Parola nouă trebuie să aibă cel puțin 6 caractere");
            }
            
            user.setPassword(newPassword);
        }
        
        // Gestionăm imaginea de profil
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String fileName = saveProfileImage(profileImage);
                user.setProfileImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Eroare la salvarea imaginii: " + e.getMessage());
            }
        }
        
        return userRepository.save(user);
    }
    
    private String saveProfileImage(MultipartFile file) throws IOException {
        // Creăm directorul dacă nu există
        String uploadDir = "uploads/profile-images/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        // Generăm un nume unic pentru fișier
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Salvăm fișierul
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());
        
        return fileName;
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    public AuthResponse login(LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            return new AuthResponse(false, "Email și parola sunt obligatorii");
        }
        
        Optional<User> userOpt = userRepository.findByEmailAndIsActiveTrue(loginRequest.getEmail());
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Email sau parolă incorectă");
        }
        
        User user = userOpt.get();
        // Verificăm parola (pentru moment, direct comparare - în producție ar trebui hash)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return new AuthResponse(false, "Email sau parolă incorectă");
        }
        
        return new AuthResponse(true, "Autentificare reușită", user);
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        if (registerRequest.getEmail() == null || registerRequest.getPassword() == null ||
            registerRequest.getFirstName() == null || registerRequest.getLastName() == null ||
            registerRequest.getPhone() == null) {
            return new AuthResponse(false, "Toate câmpurile sunt obligatorii");
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new AuthResponse(false, "Un utilizator cu acest email există deja");
        }
        
        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        newUser.setPhone(registerRequest.getPhone());
        newUser.setProfileImage(registerRequest.getProfileImage());
        
        User savedUser = userRepository.save(newUser);
        return new AuthResponse(true, "Contul a fost creat cu succes", savedUser);
    }
    
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> result = new HashMap<>();
        try {
            long userCount = userRepository.count();
            result.put("success", true);
            result.put("message", "Database connection successful");
            result.put("userCount", userCount);
            result.put("timestamp", System.currentTimeMillis());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Database connection failed: " + e.getMessage());
            result.put("timestamp", System.currentTimeMillis());
            e.printStackTrace();
        }
        return result;
    }
}
