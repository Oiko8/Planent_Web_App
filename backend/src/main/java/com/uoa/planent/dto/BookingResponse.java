package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponse {
    private Integer bookingId;
    private UserResponse attendee;
    private TicketTypeResponse ticketType;
    private LocalDateTime bookingTime;
    private Integer numberOfTickets;
    private BigDecimal totalCost;
    private String bookingStatus;
}