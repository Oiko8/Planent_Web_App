package com.uoa.planent.mapper;

import com.uoa.planent.dto.booking.BookingResponse;
import com.uoa.planent.model.Booking;

public class BookingMapper {
    public static BookingResponse toResponse(Booking booking){
        if (booking == null) return null;

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .attendeeUsername(booking.getAttendee().getUsername())
                .ticketType(EventMapper.toTicketTypeResponse(booking.getTicketType()))
                .numberOfTickets(booking.getNumberOfTickets())
                .totalCost(booking.getTotalCost())
                .bookingTime(booking.getBookingTime())
                .bookingStatus(booking.getBookingStatus())
                .build();
    }
}
