package com.scutelnic.faina.service;

import com.scutelnic.faina.entity.Ride;
import com.scutelnic.faina.entity.User;
import com.scutelnic.faina.repository.RideRepository;
import com.scutelnic.faina.dto.RideDTO;
import com.scutelnic.faina.dto.SearchRideRequest;
import com.scutelnic.faina.dto.AddRideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.ZoneId;

@Service
public class RideService {
    
    @Autowired
    private RideRepository rideRepository;
    
    public List<RideDTO> getAllActiveRides() {
        try {
            System.out.println("Fetching all active rides from database...");
            
            // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
            // cleanupExpiredRides() va fi apelată periodic sau când este necesar
            
            List<Ride> rides = rideRepository.findAllActiveRides();
            System.out.println("Found " + rides.size() + " active rides in database");
            
            List<RideDTO> rideDTOs = rides.stream()
                       .map(this::convertToDTO)
                       .collect(Collectors.toList());
            
            System.out.println("Converted " + rideDTOs.size() + " rides to DTOs");
            return rideDTOs;
        } catch (Exception e) {
            System.err.println("Error fetching rides: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    public List<RideDTO> searchRides(SearchRideRequest request) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        LocalDateTime travelDateTime = request.getTravelDate().atStartOfDay();
        
        List<Ride> rides = rideRepository.searchRides(
            request.getFromLocation(),
            request.getToLocation(),
            travelDateTime
        );
        
        // Filtrare suplimentară pentru locuri disponibile
        if (request.getPassengers() != null && request.getPassengers() > 0) {
            rides = rides.stream()
                        .filter(ride -> ride.getAvailableSeats() >= request.getPassengers())
                        .collect(Collectors.toList());
        }
        
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public RideDTO addRide(AddRideRequest request, User user) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        Ride ride = new Ride();
        ride.setFromLocation(request.getFromLocation());
        ride.setToLocation(request.getToLocation());
        ride.setTravelDate(request.getTravelDate().atStartOfDay());
        ride.setDepartureTime(LocalDateTime.of(request.getTravelDate(), request.getDepartureTime()));
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setPrice(request.getPrice());
        ride.setDescription(request.getDescription());
        ride.setUser(user);
        
        Ride savedRide = rideRepository.save(ride);
        return convertToDTO(savedRide);
    }
    
    public RideDTO getRideById(Long id) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cursa nu a fost găsită"));
        return convertToDTO(ride);
    }
    
    public List<String> getAllFromLocations() {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        return rideRepository.findAllFromLocations();
    }
    
    public List<String> getAllToLocations() {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        return rideRepository.findAllToLocations();
    }
    
    public List<RideDTO> getRidesByUser(User user) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        List<Ride> rides = rideRepository.findByUserOrderByCreatedAtDesc(user);
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public List<RideDTO> getRidesByUserId(Long userId) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        List<Ride> rides = rideRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public List<RideDTO> getTop5RecentRides() {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        List<Ride> rides = rideRepository.findTop5RecentRides();
        return rides.stream()
                   .limit(5)
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    /**
     * Curăță automat cursele care au trecut data de călătorie + 1 zi
     * Folosește timpul din Moldova (Europe/Chisinau)
     * Această metodă trebuie apelată periodic, nu la fiecare cerere
     */
    public void cleanupExpiredRides() {
        // Folosim timpul din Moldova
        ZoneId moldovaZone = ZoneId.of("Europe/Chisinau");
        LocalDateTime currentDateTime = LocalDateTime.now(moldovaZone);
        
        // Găsim toate cursele active
        List<Ride> activeRides = rideRepository.findAll().stream()
                .filter(Ride::getIsActive)
                .collect(Collectors.toList());
        
        List<Ride> expiredRides = new ArrayList<>();
        
        for (Ride ride : activeRides) {
            // Verificăm dacă a trecut mai mult de 1 zi de la data și ora cursei
            // ride.getTravelDate() conține deja data și ora de plecare
            if (currentDateTime.isAfter(ride.getTravelDate().plusDays(1))) {
                expiredRides.add(ride);
            }
        }
        
        if (!expiredRides.isEmpty()) {
            // Setăm cursele ca inactive în loc să le ștergem
            expiredRides.forEach(ride -> ride.setIsActive(false));
            rideRepository.saveAll(expiredRides);
            System.out.println("Curse expirate setate ca inactive: " + expiredRides.size());
        }
    }
    
    /**
     * Curăță cursele expirate doar dacă este necesar (la intervale mari)
     * Această metodă poate fi apelată la fiecare cerere fără să afecteze performanța
     */
    private void cleanupExpiredRidesIfNeeded() {
        // Curățăm cursele expirate doar o dată la 100 de cereri sau la intervale mari
        // Pentru moment, nu curățăm automat
        // cleanupExpiredRides() va fi apelată periodic de un scheduler
    }
    
    public void deleteRide(Long rideId, User user) {
        // Nu curățăm automat cursele expirate aici pentru a nu afecta performanța
        
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Cursa nu a fost găsită"));
        
        // Verificăm dacă utilizatorul este proprietarul cursei
        if (!ride.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Nu aveți permisiunea de a șterge această cursă");
        }
        
        // Ștergem cursa
        rideRepository.delete(ride);
    }
    
    private RideDTO convertToDTO(Ride ride) {
        if (ride == null) {
            return null;
        }
        
        User user = ride.getUser();
        if (user == null || user.getId() == null) {
            // Dacă user-ul este null sau nu are ID, returnăm un DTO cu informații minime
            return new RideDTO(
                ride.getId(),
                ride.getFromLocation(),
                ride.getToLocation(),
                ride.getDepartureTime(),
                ride.getTravelDate(),
                ride.getAvailableSeats(),
                ride.getPrice(),
                ride.getDescription(),
                0L, // ID-ul utilizatorului nu poate fi 0, deci nu va fi clickabil
                "Utilizator necunoscut",
                "N/A",
                "N/A",
                null,
                ride.getCreatedAt(),
                ride.getIsActive()
            );
        }
        
        return new RideDTO(
            ride.getId(),
            ride.getFromLocation(),
            ride.getToLocation(),
            ride.getDepartureTime(),
            ride.getTravelDate(),
            ride.getAvailableSeats(),
            ride.getPrice(),
            ride.getDescription(),
            user.getId(),
            user.getFirstName() + " " + user.getLastName(),
            user.getPhone(),
            user.getEmail(),
            user.getProfileImage(),
            ride.getCreatedAt(),
            ride.getIsActive()
        );
    }
}
