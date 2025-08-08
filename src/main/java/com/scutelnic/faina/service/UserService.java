package com.scutelnic.faina.service;

import com.scutelnic.faina.entity.User;
import com.scutelnic.faina.repository.UserRepository;
import com.scutelnic.faina.dto.LoginRequest;
import com.scutelnic.faina.dto.RegisterRequest;
import com.scutelnic.faina.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

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
        if (!Objects.equals(user.getPassword(), loginRequest.getPassword())) {
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
}
