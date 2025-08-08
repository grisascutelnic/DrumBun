package com.scutelnic.faina.repository;

import com.scutelnic.faina.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    
    @Query("SELECT r FROM Ride r JOIN FETCH r.user WHERE r.isActive = true AND r.travelDate >= :currentDate ORDER BY r.travelDate ASC")
    List<Ride> findAllActiveRides(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT r FROM Ride r JOIN FETCH r.user WHERE r.isActive = true AND r.fromLocation LIKE %:fromLocation% AND r.toLocation LIKE %:toLocation% AND r.travelDate >= :travelDate ORDER BY r.travelDate ASC")
    List<Ride> searchRides(@Param("fromLocation") String fromLocation, 
                           @Param("toLocation") String toLocation, 
                           @Param("travelDate") LocalDateTime travelDate);
    
    @Query("SELECT r FROM Ride r JOIN FETCH r.user WHERE r.isActive = true AND r.availableSeats >= :minSeats ORDER BY r.travelDate ASC")
    List<Ride> findRidesByAvailableSeats(@Param("minSeats") Integer minSeats);
    
    @Query("SELECT DISTINCT r.fromLocation FROM Ride r WHERE r.isActive = true ORDER BY r.fromLocation")
    List<String> findAllFromLocations();
    
    @Query("SELECT DISTINCT r.toLocation FROM Ride r WHERE r.isActive = true ORDER BY r.toLocation")
    List<String> findAllToLocations();
    
    @Query("SELECT r FROM Ride r JOIN FETCH r.user WHERE r.user = :user ORDER BY r.createdAt DESC")
    List<Ride> findByUserOrderByCreatedAtDesc(@Param("user") com.scutelnic.faina.entity.User user);
}
