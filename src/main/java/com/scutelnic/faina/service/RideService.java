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

@Service
public class RideService {
    
    @Autowired
    private RideRepository rideRepository;
    
    public List<RideDTO> getAllActiveRides() {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
        LocalDateTime currentDate = LocalDateTime.now();
        List<Ride> rides = rideRepository.findAllActiveRides(currentDate);
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public List<RideDTO> searchRides(SearchRideRequest request) {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
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
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
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
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cursa nu a fost găsită"));
        return convertToDTO(ride);
    }
    
    public List<String> getAllFromLocations() {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        return rideRepository.findAllFromLocations();
    }
    
    public List<String> getAllToLocations() {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        return rideRepository.findAllToLocations();
    }
    
    public List<RideDTO> getRidesByUser(User user) {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
        List<Ride> rides = rideRepository.findByUserOrderByCreatedAtDesc(user);
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public List<RideDTO> getRidesByUserId(Long userId) {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
        List<Ride> rides = rideRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return rides.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    public List<RideDTO> getTop5RecentRides() {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
        List<Ride> rides = rideRepository.findTop5RecentRides();
        return rides.stream()
                   .limit(5)
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    
    /**
     * Curăță automat cursele care au trecut data de călătorie
     */
    public void cleanupExpiredRides() {
        LocalDateTime currentDateTime = LocalDateTime.now();
        List<Ride> expiredRides = rideRepository.findExpiredRides(currentDateTime);
        
        if (!expiredRides.isEmpty()) {
            // Setăm cursele ca inactive în loc să le ștergem
            expiredRides.forEach(ride -> ride.setIsActive(false));
            rideRepository.saveAll(expiredRides);
        }
    }
    
    public void deleteRide(Long rideId, User user) {
        // Curățăm automat cursele expirate
        cleanupExpiredRides();
        
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
        User user = ride.getUser();
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
