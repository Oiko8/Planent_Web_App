package com.uoa.planent.controller;

import com.uoa.planent.dto.event.CategoryResponse;
import com.uoa.planent.dto.event.EventCreateRequest;
import com.uoa.planent.dto.event.EventResponse;
import com.uoa.planent.dto.event.EventSearchRequest;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.EventService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
// import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
// import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    // ---- public endpoints ----

    @GetMapping
    public ResponseEntity<Page<EventResponse>> getAllPublishedEvents(Pageable pageable) {
        return ResponseEntity.ok(eventService.getAllPublishedEvents(pageable));
    }

    // returns draft events only to the organizer of that event (if authenticated)
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Integer eventId, @AuthenticationPrincipal UserDetailsImpl currentUser){
        Integer currentUserId = (currentUser != null) ? currentUser.getId() : null; // null when not signed in
        return ResponseEntity.ok(eventService.getEventById(eventId, currentUserId));
    }


    @GetMapping("/search")
    public ResponseEntity<Page<EventResponse>> searchPublishedEvents(@ModelAttribute @Valid EventSearchRequest request, Pageable pageable){
        return ResponseEntity.ok(eventService.searchPublishedEvents(request, pageable));
    }


    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllEventCategories() {
        return ResponseEntity.ok(eventService.getAllCategories());
    }






    // ---- authenticated only endpoints ----


    @GetMapping("/my-events")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<EventResponse>> getMyEvents(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser, Pageable pageable) {
        return ResponseEntity.ok(eventService.getMyEvents(currentUser.getId(), pageable)); // authenticated == non-null user id
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("@eventService.isOrganizer(#eventId, principal)") // organizer can delete only
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponse> createEvent(@RequestBody @Valid EventCreateRequest request, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request, currentUser.getId()));
    }

}