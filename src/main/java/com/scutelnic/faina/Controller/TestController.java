package com.scutelnic.faina.Controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/session")
    public Map<String, Object> testSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("creationTime", session.getCreationTime());
        response.put("lastAccessedTime", session.getLastAccessedTime());
        response.put("maxInactiveInterval", session.getMaxInactiveInterval());
        
        Object user = session.getAttribute("user");
        response.put("userInSession", user != null);
        if (user != null) {
            response.put("userClass", user.getClass().getSimpleName());
        }
        
        return response;
    }

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
