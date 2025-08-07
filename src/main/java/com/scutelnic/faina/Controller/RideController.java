package com.scutelnic.faina.Controller;

import com.scutelnic.faina.service.RideService;
import com.scutelnic.faina.dto.RideDTO;
import com.scutelnic.faina.dto.SearchRideRequest;
import com.scutelnic.faina.dto.AddRideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {
    
    @Autowired
    private RideService rideService;
    
    @GetMapping
    public ResponseEntity<List<RideDTO>> getAllRides() {
        List<RideDTO> rides = rideService.getAllActiveRides();
        return ResponseEntity.ok(rides);
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
    
    @PostMapping("/search")
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
            @RequestParam String driverName,
            @RequestParam String driverPhone) {
        
        try {
            AddRideRequest request = new AddRideRequest();
            request.setFromLocation(fromLocation);
            request.setToLocation(toLocation);
            request.setTravelDate(LocalDate.parse(travelDate));
            request.setDepartureTime(java.time.LocalTime.parse(departureTime));
            request.setAvailableSeats(availableSeats);
            request.setPrice(java.math.BigDecimal.valueOf(price));
            request.setDescription(description);
            request.setDriverName(driverName);
            request.setDriverPhone(driverPhone);
            
            RideDTO savedRide = rideService.addRide(request);
            
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
}
