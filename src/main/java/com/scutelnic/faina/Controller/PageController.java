package com.scutelnic.faina.Controller;

import com.scutelnic.faina.service.RideService;
import com.scutelnic.faina.dto.RideDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
    public String rides(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model) {
        try {
            // Filtrare și paginare
            List<RideDTO> allRides = rideService.getAllActiveRides();
            
            // Filtrare
            List<RideDTO> filteredRides = allRides.stream()
                .filter(ride -> from == null || from.isEmpty() || 
                        ride.getFromLocation().toLowerCase().contains(from.toLowerCase()))
                .filter(ride -> to == null || to.isEmpty() || 
                        ride.getToLocation().toLowerCase().contains(to.toLowerCase()))
                .filter(ride -> date == null || date.isEmpty() || 
                        ride.getTravelDate().toString().equals(date))
                .collect(Collectors.toList());
            
            // Paginare
            int totalRides = filteredRides.size();
            int totalPages = (int) Math.ceil((double) totalRides / size);
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalRides);
            
            List<RideDTO> pagedRides = filteredRides.subList(startIndex, endIndex);
            
            // Adăugăm atributele în model
            model.addAttribute("allRides", pagedRides);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            model.addAttribute("totalRides", totalRides);
            model.addAttribute("hasNextPage", page < totalPages - 1);
            model.addAttribute("hasPreviousPage", page > 0);
            
            // Pentru filtre
            model.addAttribute("filterFrom", from != null ? from : "");
            model.addAttribute("filterTo", to != null ? to : "");
            model.addAttribute("filterDate", date != null ? date : "");
            
        } catch (Exception e) {
            // Dacă apare o eroare, setăm o listă goală pentru a evita eroarea
            model.addAttribute("allRides", new ArrayList<>());
            model.addAttribute("currentPage", 0);
            model.addAttribute("totalPages", 0);
            model.addAttribute("totalRides", 0);
            model.addAttribute("hasNextPage", false);
            model.addAttribute("hasPreviousPage", false);
            model.addAttribute("filterFrom", "");
            model.addAttribute("filterTo", "");
            model.addAttribute("filterDate", "");
        }
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
        try {
            // Verificăm dacă userId-ul este valid
            if (userId == null || userId <= 0) {
                throw new IllegalArgumentException("Invalid user ID: " + userId);
            }
            
            // Adăugăm userId-ul în model pentru a fi folosit în template
            model.addAttribute("targetUserId", userId);
            return "profile";
        } catch (Exception e) {
            // Logăm eroarea
            System.err.println("Error in userProfile: " + e.getMessage());
            e.printStackTrace();
            
            // Redirecționăm la pagina principală în caz de eroare
            return "redirect:/";
        }
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
