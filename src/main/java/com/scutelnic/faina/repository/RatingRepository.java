package com.scutelnic.faina.repository;

import com.scutelnic.faina.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    
    // Find all ratings for a specific user
    List<Rating> findByRatedUserIdOrderByCreatedAtDesc(Long ratedUserId);
    
    // Find rating given by a specific user to another specific user
    Optional<Rating> findByRaterIdAndRatedUserId(Long raterId, Long ratedUserId);
    
    // Check if a user has already rated another user
    boolean existsByRaterIdAndRatedUserId(Long raterId, Long ratedUserId);
    
    // Get average rating for a user
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.ratedUser.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") Long userId);
    
    // Get total number of ratings for a user
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.ratedUser.id = :userId")
    Long getTotalRatingsByUserId(@Param("userId") Long userId);
}
