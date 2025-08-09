package com.scutelnic.faina.service;

import com.scutelnic.faina.entity.Rating;
import com.scutelnic.faina.entity.User;
import com.scutelnic.faina.repository.RatingRepository;
import com.scutelnic.faina.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RatingService {
    
    @Autowired
    private RatingRepository ratingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Add or update a rating for a user
     */
    public Rating addOrUpdateRating(Long raterId, Long ratedUserId, Integer rating, String comment) {
        System.out.println("🔍 RatingService.addOrUpdateRating called with: raterId=" + raterId + ", ratedUserId=" + ratedUserId + ", rating=" + rating);
        
        // Validate rating value
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        // Check if users exist
        User rater = userRepository.findById(raterId)
                .orElseThrow(() -> new RuntimeException("Rater user not found with ID: " + raterId));
        
        User ratedUser = userRepository.findById(ratedUserId)
                .orElseThrow(() -> new RuntimeException("Rated user not found with ID: " + ratedUserId));
        
        System.out.println("✅ Users found: rater=" + rater.getEmail() + ", rated=" + ratedUser.getEmail());
        
        // Check if user is trying to rate themselves
        if (raterId.equals(ratedUserId)) {
            throw new RuntimeException("Users cannot rate themselves");
        }
        
        // Check if rating already exists
        Optional<Rating> existingRating = ratingRepository.findByRaterIdAndRatedUserId(raterId, ratedUserId);
        System.out.println("🔍 Existing rating check: " + (existingRating.isPresent() ? "found" : "not found"));
        
        Rating savedRating;
        if (existingRating.isPresent()) {
            // Update existing rating
            Rating ratingToUpdate = existingRating.get();
            ratingToUpdate.setRating(rating);
            ratingToUpdate.setComment(comment);
            savedRating = ratingRepository.save(ratingToUpdate);
            System.out.println("✅ Updated existing rating: " + savedRating.getId());
        } else {
            // Create new rating
            Rating newRating = new Rating();
            newRating.setRater(rater);
            newRating.setRatedUser(ratedUser);
            newRating.setRating(rating);
            newRating.setComment(comment);
            savedRating = ratingRepository.save(newRating);
            System.out.println("✅ Created new rating: " + savedRating.getId());
        }
        
        // Update user's rating statistics
        updateUserRatingStats(ratedUserId);
        
        return savedRating;
    }
    
    /**
     * Get all ratings for a specific user
     */
    public List<Rating> getUserRatings(Long userId) {
        return ratingRepository.findByRatedUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get average rating for a user
     */
    public Double getAverageRating(Long userId) {
        Double avgRating = ratingRepository.getAverageRatingByUserId(userId);
        return avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
    }
    
    /**
     * Get total number of ratings for a user
     */
    public Long getTotalRatings(Long userId) {
        return ratingRepository.getTotalRatingsByUserId(userId);
    }
    
    /**
     * Check if a user has already rated another user
     */
    public boolean hasUserRated(Long raterId, Long ratedUserId) {
        System.out.println("🔍 RatingService.hasUserRated called with: raterId=" + raterId + ", ratedUserId=" + ratedUserId);
        boolean exists = ratingRepository.existsByRaterIdAndRatedUserId(raterId, ratedUserId);
        System.out.println("🔍 Rating exists: " + exists);
        return exists;
    }
    
    /**
     * Get existing rating if user has already rated
     */
    public Optional<Rating> getExistingRating(Long raterId, Long ratedUserId) {
        return ratingRepository.findByRaterIdAndRatedUserId(raterId, ratedUserId);
    }
    
    /**
     * Delete a rating
     */
    public void deleteRating(Long ratingId, Long raterId) {
        Optional<Rating> rating = ratingRepository.findById(ratingId);
        if (rating.isPresent() && rating.get().getRater().getId().equals(raterId)) {
            Long ratedUserId = rating.get().getRatedUser().getId();
            ratingRepository.deleteById(ratingId);
            
            // Update user's rating statistics
            updateUserRatingStats(ratedUserId);
        } else {
            throw new RuntimeException("Rating not found or user not authorized to delete it");
        }
    }
    
    /**
     * Update user's rating statistics
     */
    public void updateUserRatingStats(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            Double avgRating = getAverageRating(userId);
            Long totalRatings = getTotalRatings(userId);
            
            System.out.println("📊 Updating user stats for ID " + userId + ": avg=" + avgRating + ", total=" + totalRatings);
            
            user.setAverageRating(avgRating);
            user.setTotalRatings(totalRatings);
            
            userRepository.save(user);
            System.out.println("✅ User stats updated successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Error updating user rating stats: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
