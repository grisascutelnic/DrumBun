package com.scutelnic.faina.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    
    @GetMapping("/")
    public String index() {
        return "index";
    }
    
    @GetMapping("/about")
    public String about() {
        return "about";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
    
    @GetMapping("/rides")
    public String rides() {
        return "rides";
    }
    
    @GetMapping("/add-ride")
    public String addRide() {
        return "add-ride";
    }
}
