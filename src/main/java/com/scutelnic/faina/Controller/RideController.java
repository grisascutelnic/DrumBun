package com.scutelnic.faina.Controller;

import com.scutelnic.faina.service.RideService;
import com.scutelnic.faina.dto.RideDTO;
import com.scutelnic.faina.dto.SearchRideRequest;
import com.scutelnic.faina.dto.AddRideRequest;
import com.scutelnic.faina.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/rides")
public class RideController {
    
    @Autowired
    private RideService rideService;
    
    @GetMapping
    public ResponseEntity<List<RideDTO>> getAllRides() {
        try {
            System.out.println("API call to get all rides");
            List<RideDTO> rides = rideService.getAllActiveRides();
            System.out.println("Returning " + rides.size() + " rides");
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            System.err.println("Error in getAllRides: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<RideDTO> rides = rideService.getAllActiveRides();
            response.put("success", true);
            response.put("message", "Database connection successful");
            response.put("ridesCount", rides.size());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Database connection failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RideDTO> getRideById(@PathVariable Long id) {
        try {
            RideDTO ride = rideService.getRideById(id);
            return ResponseEntity.ok(ride);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchRides(
            @RequestParam String fromLocation,
            @RequestParam String toLocation,
            @RequestParam String travelDate,
            @RequestParam(defaultValue = "1") int passengers,
            @RequestParam(defaultValue = "0") int luggage) {
        
        try {
            SearchRideRequest request = new SearchRideRequest();
            request.setFromLocation(fromLocation);
            request.setToLocation(toLocation);
            request.setTravelDate(LocalDate.parse(travelDate));
            request.setPassengers(passengers);
            request.setLuggage(luggage);
            
            List<RideDTO> results = rideService.searchRides(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Căutarea a fost realizată cu succes!");
            response.put("results", results);
            response.put("count", results.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Eroare la căutare: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> addRide(
            @RequestParam String fromLocation,
            @RequestParam String toLocation,
            @RequestParam String travelDate,
            @RequestParam String departureTime,
            @RequestParam int availableSeats,
            @RequestParam double price,
            @RequestParam String description,
            HttpSession session) {
        
        try {
            // Verificăm dacă utilizatorul este logat
            User user = (User) session.getAttribute("user");
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a adăuga o cursă.");
                return ResponseEntity.status(401).body(response);
            }
            
            AddRideRequest request = new AddRideRequest();
            request.setFromLocation(fromLocation);
            request.setToLocation(toLocation);
            request.setTravelDate(LocalDate.parse(travelDate));
            request.setDepartureTime(LocalTime.parse(departureTime));
            request.setAvailableSeats(availableSeats);
            request.setPrice(BigDecimal.valueOf(price));
            request.setDescription(description);
            
            RideDTO savedRide = rideService.addRide(request, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cursa a fost adăugată cu succes!");
            response.put("ride", savedRide);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Eroare la adăugarea cursei: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/locations/from")
    public ResponseEntity<List<String>> getAllFromLocations() {
        List<String> locations = rideService.getAllFromLocations();
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/locations/to")
    public ResponseEntity<List<String>> getAllToLocations() {
        List<String> locations = rideService.getAllToLocations();
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/my-rides")
    public ResponseEntity<List<RideDTO>> getMyRides(HttpSession session) {
        try {
            // Verificăm dacă utilizatorul este logat
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            
            List<RideDTO> rides = rideService.getRidesByUser(user);
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RideDTO>> getRidesByUserId(@PathVariable Long userId) {
        try {
            List<RideDTO> rides = rideService.getRidesByUserId(userId);
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRide(@PathVariable Long id, HttpSession session) {
        try {
            // Verificăm dacă utilizatorul este logat
            User user = (User) session.getAttribute("user");
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a șterge o cursă.");
                return ResponseEntity.status(401).body(response);
            }
            
            // Ștergem cursa
            rideService.deleteRide(id, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cursa a fost ștearsă cu succes!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Eroare la ștergerea cursei: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
