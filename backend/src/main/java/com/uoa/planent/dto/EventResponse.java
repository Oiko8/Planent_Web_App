package com.uoa.planent.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EventResponse {
    private Integer eventId;
    private String title;
    private String eventType;
    private String venue;
    private String country;
    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private Integer capacity;
    private String status;
    private String description;
    private UserRegisterResponse organizer;
    private List<CategoryResponse> categories;
    private List<TicketTypeResponse> ticketTypes;
}