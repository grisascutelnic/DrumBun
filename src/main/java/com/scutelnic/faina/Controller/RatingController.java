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

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    
    @Autowired
    private RatingService ratingService;
    
    /**
     * Add or update a rating
     */
    @PostMapping("/rate")
    public ResponseEntity<Map<String, Object>> rateUser(
            @RequestParam Long ratedUserId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if user is logged in
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Trebuie să fiți logat pentru a pune un rating.");
                return ResponseEntity.status(401).body(response);
            }
            
            // Add or update rating
            Rating savedRating = ratingService.addOrUpdateRating(
                currentUser.getId(), 
                ratedUserId, 
                rating, 
                comment
            );
            
            response.put("success", true);
            response.put("message", "Rating-ul a fost salvat cu succes!");
            response.put("rating", savedRating);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Eroare la salvarea rating-ului: " + e.getMessage());
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
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Utilizatorul nu este autentificat.");
                response.put("hasRated", false);
                return ResponseEntity.ok(response);
            }
            
            boolean hasRated = ratingService.hasUserRated(currentUser.getId(), ratedUserId);
            response.put("success", true);
            response.put("hasRated", hasRated);
            
            if (hasRated) {
                // Get existing rating details
                var existingRating = ratingService.getExistingRating(currentUser.getId(), ratedUserId);
                if (existingRating.isPresent()) {
                    response.put("existingRating", existingRating.get());
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
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
