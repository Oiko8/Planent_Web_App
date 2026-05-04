package com.uoa.planent.service;

import com.uoa.planent.dto.booking.BookingCreateRequest;
import com.uoa.planent.dto.booking.BookingResponse;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.BookingMapper;
import com.uoa.planent.model.Booking;
import com.uoa.planent.model.EventTicketType;
import com.uoa.planent.model.User;
import com.uoa.planent.repository.BookingRepository;
import com.uoa.planent.repository.EventTicketTypeRepository;
import com.uoa.planent.repository.UserRepository;
import com.uoa.planent.security.UserDetailsImpl;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@AllArgsConstructor
@Service
@Validated // null checks
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventTicketTypeRepository ticketTypeRepository;

    public boolean isAttendeeOrAdmin(@NotNull Integer bookingId, UserDetailsImpl user) throws ResourceNotFoundException {
        if (user == null) return false; // access denied exception by default if false

        // check if admin
        boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> Objects.equals(a.getAuthority(), "ADMIN"));
        if (isAdmin) return true;

        // check if attendee (the user that made the booking)
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking with ID '" + bookingId + "' not found."));
        return booking.getAttendee().getId().equals(user.getId());
    }




    public Page<BookingResponse> getMyBookings(@NotNull Integer attendeeId, Pageable pageable) {
        return bookingRepository.findAllByAttendeeId(attendeeId, pageable).map(BookingMapper::toResponse);
    }

    public BookingResponse getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking with ID '" + bookingId + "' not found."));
        return BookingMapper.toResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, @NotNull Integer attendeeId) {
        // get attendee
        User attendee = userRepository.findById(attendeeId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + attendeeId + "' not found."));

        // get ticket type
        EventTicketType ticketType = ticketTypeRepository.findById(request.getTicketTypeId()).orElseThrow(() -> new ResourceNotFoundException("Ticket type with ID '" + request.getTicketTypeId() + "' not found."));

        // try booking on the ticket type
        // will throw an exception if unable to book
        BigDecimal totalCost = ticketType.tryBook(request.getNumberOfTickets());
        ticketTypeRepository.save(ticketType);

        // create the booking
        Booking booking = Booking.builder()
                .attendee(attendee)
                .ticketType(ticketType)
                .numberOfTickets(request.getNumberOfTickets())
                .totalCost(totalCost)
                .bookingTime(Instant.now())
                .bookingStatus(Booking.BookingStatus.CONFIRMED)
                .build();
        Booking savedBooking = bookingRepository.save(booking);

        return BookingMapper.toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse cancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking with ID '" + bookingId + "' not found."));

        // try cancelling the booking
        // will throw an exception if unable to
        booking.tryCancel();

        Booking savedBooking = bookingRepository.save(booking);
        return BookingMapper.toResponse(savedBooking);
    }
}
