package com.uoa.planent.controller;

import com.uoa.planent.dto.booking.BookingCreateRequest;
import com.uoa.planent.dto.booking.BookingResponse;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.BookingService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    // ---- authenticated & admin endpoints ----

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser, Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyBookings(currentUser.getId(), pageable)); // authenticated == non-null user id
    }

    // only gets the bookings for the attendee
    // or if admin
    @GetMapping("/{bookingId}")
    @PreAuthorize("@bookingService.isAttendeeOrAdmin(#bookingId, principal)")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }


    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody @Valid BookingCreateRequest request, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, currentUser.getId()));
    }


    // attendee or admin can cancel only
    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("@bookingService.isAttendeeOrAdmin(#bookingId, principal)")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId));
    }
}
