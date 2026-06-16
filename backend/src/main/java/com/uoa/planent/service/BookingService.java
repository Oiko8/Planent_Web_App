package com.uoa.planent.service;

import com.uoa.planent.dto.booking.BookingCreateRequest;
import com.uoa.planent.dto.booking.BookingResponse;
import com.uoa.planent.event.BookingConfirmedEvent;
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
import org.springframework.context.ApplicationEventPublisher;
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

    private final ApplicationEventPublisher eventPublisher;

    public boolean isAttendeeOrAdmin(@NotNull Integer bookingId, UserDetailsImpl user) throws ResourceNotFoundException {
        if (user == null) return false; // access denied exception by default if false

        // check if admin
        if (user.isAdmin()) return true;

        // check if attendee (the user that made the booking)
        return bookingRepository.existsByIdAndAttendee_Id(bookingId, user.getId());
    }




    public Page<BookingResponse> getMyBookings(@NotNull Integer attendeeId, Pageable pageable) {
        return bookingRepository.findMyBookingsWithRelations(attendeeId, pageable).map(BookingMapper::toResponse);
    }

    // Bookings for a specific event — for organizer/admin only (enforced in the controller)
    public Page<BookingResponse> getBookingsByEvent(@NotNull Integer eventId, Pageable pageable) {
        return bookingRepository.findEventBookingsWithRelations(eventId, pageable).map(BookingMapper::toResponse);
    }

    public BookingResponse getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findByIdWithEvent(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking with ID '" + bookingId + "' not found."));
        return BookingMapper.toResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, @NotNull Integer attendeeId) {
        // get attendee
        User attendee = userRepository.findById(attendeeId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + attendeeId + "' not found."));

        // get ticket type and lock its row to avoid race conditions (overbooking). eagerly fetch event as well since we use it
        // lock lasts until the transaction finished
        EventTicketType ticketType = ticketTypeRepository.findAndLockByIdWithEvent(request.getTicketTypeId()).orElseThrow(() -> new ResourceNotFoundException("Ticket type with ID '" + request.getTicketTypeId() + "' not found."));

        // organizer cannot book on his own event
        if (Objects.equals(ticketType.getEvent().getOrganizer().getId(), attendeeId)) {
            throw new IllegalArgumentException("Organizers cannot book tickets for their own events.");
        }

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

        // record interaction (async after transaction commit)
        eventPublisher.publishEvent(new BookingConfirmedEvent(attendeeId, ticketType.getEvent().getId()));

        return BookingMapper.toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse cancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findByIdWithRelations(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking with ID '" + bookingId + "' not found."));

        // lock ticket type to avoid race conditions (overbooking)
        int ticketTypeId = booking.getTicketType().getId();
        ticketTypeRepository.findAndLockById(ticketTypeId).orElseThrow(() -> new ResourceNotFoundException("Ticket type with ID " + ticketTypeId + "' not found."));

        // try cancelling the booking
        // will throw an exception if unable to
        booking.tryCancel();

        Booking savedBooking = bookingRepository.save(booking);
        return BookingMapper.toResponse(savedBooking);
    }
}