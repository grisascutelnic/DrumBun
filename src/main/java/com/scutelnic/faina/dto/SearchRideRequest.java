package com.scutelnic.faina.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SearchRideRequest {
    private String fromLocation;
    private String toLocation;
    private LocalDate travelDate;
    private Integer passengers;
    private Integer luggage;
}
