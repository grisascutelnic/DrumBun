package com.scutelnic.faina.Controller;

import com.scutelnic.faina.entity.Rating;
import com.scutelnic.faina.entity.User;
import com.scutelnic.faina.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.scutelnic.faina.repository.RatingRepository;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private RatingRepository ratingRepository;
    
    /**
     * Add or update a rating
     */
    @PostMapping("/rate")
    public ResponseEntity<Map<String, Object>> rateUser(
            @RequestParam Long ratedUserId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            HttpSession session) {
        
        System.out.println("🔍 RatingController.rateUser called with: ratedUserId=" + ratedUserId + ", rating=" + rating + ", comment=" + comment);
        System.out.println("🔍 Session ID: " + session.getId());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if user is logged in
            User currentUser = (User) session.getAttribute("user");
            System.out.println("🔍 Current user from session: " + (currentUser != null ? currentUser.getEmail() + " (ID: " + currentUser.getId() + ")" : "null"));
            
            if (currentUser == null) {
                System.out.println("❌ User not authenticated");
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a pune un rating.");
                return ResponseEntity.status(401).body(response);
            }
            
            System.out.println("✅ User authenticated: " + currentUser.getEmail());
            
            // Add or update rating
            Rating savedRating = ratingService.addOrUpdateRating(
                currentUser.getId(), 
                ratedUserId, 
                rating, 
                comment
            );
            
            System.out.println("✅ Rating saved successfully: " + savedRating.getId());
            
            response.put("success", true);
            response.put("message", "Rating-ul a fost salvat cu succes!");
            response.put("rating", savedRating);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error saving rating: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Eroare la salvarea rating-ului: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Update an existing rating
     */
    @PutMapping("/{ratingId}")
    public ResponseEntity<Map<String, Object>> updateRating(
            @PathVariable Long ratingId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            HttpSession session) {
        
        System.out.println("🔍 RatingController.updateRating called with: ratingId=" + ratingId + ", rating=" + rating);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if user is logged in
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a actualiza un rating.");
                return ResponseEntity.status(401).body(response);
            }
            
            // Get the existing rating
            Optional<Rating> existingRating = ratingRepository.findById(ratingId);
            if (!existingRating.isPresent()) {
                response.put("success", false);
                response.put("message", "Rating-ul nu a fost găsit.");
                return ResponseEntity.notFound().build();
            }
            
            Rating ratingToUpdate = existingRating.get();
            
            // Check if user owns this rating
            if (!ratingToUpdate.getRater().getId().equals(currentUser.getId())) {
                response.put("success", false);
                response.put("message", "Nu aveți permisiunea să actualizați acest rating.");
                return ResponseEntity.status(403).body(response);
            }
            
            // Update rating
            ratingToUpdate.setRating(rating);
            ratingToUpdate.setComment(comment);
            
            Rating updatedRating = ratingRepository.save(ratingToUpdate);
            
            // Update user's rating statistics
            ratingService.updateUserRatingStats(ratingToUpdate.getRatedUser().getId());
            
            response.put("success", true);
            response.put("message", "Rating-ul a fost actualizat cu succes!");
            response.put("rating", updatedRating);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error updating rating: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Eroare la actualizarea rating-ului: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get all ratings for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserRatings(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Rating> ratings = ratingService.getUserRatings(userId);
            Double averageRating = ratingService.getAverageRating(userId);
            Long totalRatings = ratingService.getTotalRatings(userId);
            
            response.put("success", true);
            response.put("ratings", ratings);
            response.put("averageRating", averageRating);
            response.put("totalRatings", totalRatings);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Eroare la încărcarea rating-urilor: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Check if current user has rated a specific user
     */
    @GetMapping("/check/{ratedUserId}")
    public ResponseEntity<Map<String, Object>> checkUserRating(
            @PathVariable Long ratedUserId,
            HttpSession session) {
        
        System.out.println("🔍 RatingController.checkUserRating called with: ratedUserId=" + ratedUserId);
        System.out.println("🔍 Session ID: " + session.getId());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            System.out.println("🔍 Current user from session: " + (currentUser != null ? currentUser.getEmail() + " (ID: " + currentUser.getId() + ")" : "null"));
            
            if (currentUser == null) {
                System.out.println("❌ User not authenticated");
                response.put("success", false);
                response.put("message", "Utilizatorul nu este autentificat.");
                response.put("hasRated", false);
                return ResponseEntity.ok(response);
            }
            
            System.out.println("✅ User authenticated: " + currentUser.getEmail());
            
            boolean hasRated = ratingService.hasUserRated(currentUser.getId(), ratedUserId);
            System.out.println("🔍 Has user rated: " + hasRated);
            
            response.put("success", true);
            response.put("hasRated", hasRated);
            
            if (hasRated) {
                // Get existing rating details
                var existingRating = ratingService.getExistingRating(currentUser.getId(), ratedUserId);
                if (existingRating.isPresent()) {
                    response.put("existingRating", existingRating.get());
                    System.out.println("✅ Existing rating found: " + existingRating.get().getId());
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error checking rating: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Eroare la verificarea rating-ului: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Delete a rating
     */
    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Map<String, Object>> deleteRating(
            @PathVariable Long ratingId,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a șterge un rating.");
                return ResponseEntity.status(401).body(response);
            }
            
            ratingService.deleteRating(ratingId, currentUser.getId());
            
            response.put("success", true);
            response.put("message", "Rating-ul a fost șters cu succes!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Eroare la ștergerea rating-ului: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
