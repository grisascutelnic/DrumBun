package com.scutelnic.faina.Controller;

import com.scutelnic.faina.service.RideService;
import com.scutelnic.faina.dto.RideDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.ArrayList;

@Controller
public class PageController {
    
    @Autowired
    private RideService rideService;
    
    @GetMapping("/")
    public String index(Model model) {
        try {
            List<RideDTO> recentRides = rideService.getTop5RecentRides();
            model.addAttribute("recentRides", recentRides);
        } catch (Exception e) {
            // Dacă apare o eroare, setăm o listă goală pentru a evita eroarea
            model.addAttribute("recentRides", new ArrayList<>());
        }
        return "index";
    }
    
    @GetMapping("/about")
    public String about() {
        return "about";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
    
    @GetMapping("/rides")
    public String rides(Model model) {
        List<RideDTO> rides = rideService.getAllActiveRides();
        model.addAttribute("rides", rides);
        return "rides";
    }
    
    @GetMapping("/add-ride")
    public String addRide() {
        return "add-ride";
    }
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }
    
    @GetMapping("/profile/{userId}")
    public String userProfile(@PathVariable Long userId, Model model) {
        // Adăugăm userId-ul în model pentru a fi folosit în template
        model.addAttribute("targetUserId", userId);
        return "profile";
    }
    
    @GetMapping("/edit-profile")
    public String editProfile() {
        return "edit-profile";
    }
    
    @GetMapping("/uploads/profile-images/{filename}")
    @ResponseBody
    public ResponseEntity<Resource> serveProfileImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/profile-images/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
