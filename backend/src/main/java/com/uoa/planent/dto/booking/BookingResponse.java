package com.uoa.planent.dto.booking;


import com.uoa.planent.dto.event.TicketTypeResponse;
import com.uoa.planent.model.Booking;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
@Jacksonized
public class BookingResponse {
    Integer bookingId;
    Integer eventId;
    String eventTitle;
    String attendeeUsername;
    TicketTypeResponse ticketType;
    Integer numberOfTickets;
    BigDecimal totalCost;
    Instant bookingTime;
    Booking.BookingStatus bookingStatus;
}