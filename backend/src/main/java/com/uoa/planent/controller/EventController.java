package com.uoa.planent.controller;

import com.uoa.planent.dto.event.*;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.EventService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
// import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
// import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.uoa.planent.service.EventViewService;
import org.springframework.web.multipart.MultipartFile;

// import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventViewService eventViewService;


    // Endpoints returning paged event responses return an EventSummaryResponse,
    // which excludes nested lazy fetched sets (categories, media, ticket types) to avoid frontend overfetching.
    // Those are loaded on-demand only when viewing a specific event (getEventById).
    //
    // To eliminate the N+1 query problem during pagination, a global batch fetch size is set (set at 50).
    // For example:
    // - 50 events processed -> 1 main query + 1 batch query for media.
    // - 51 events processed -> 1 main query + 2 batch queries for media (due to the size-50 boundary).


    // ---- public endpoints ----

    // returns all non-draft events
    @GetMapping
    public ResponseEntity<Page<EventSummaryResponse>> getAllVisibleEvents(Pageable pageable) {
        return ResponseEntity.ok(eventService.getAllVisibleEvents(pageable));
    }

    // returns draft events only to the organizer of that event (if authenticated)
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Integer eventId, @AuthenticationPrincipal UserDetailsImpl currentUser){
        Integer currentUserId = (currentUser != null) ? currentUser.getId() : null; // null when not signed in
        return ResponseEntity.ok(eventService.getEventById(eventId, currentUserId));
    }


    // searches from all non-draft events
    @GetMapping("/search")
    public ResponseEntity<Page<EventSummaryResponse>> searchVisibleEvents(@ModelAttribute @Valid EventSearchRequest request, Pageable pageable){
        return ResponseEntity.ok(eventService.searchVisibleEvents(request, pageable));
    }


    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllEventCategories() {
        return ResponseEntity.ok(eventService.getAllCategories());
    }






    // ---- authenticated only endpoints ----


    @GetMapping("/my-events")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<EventSummaryResponse>> getMyEvents(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser, Pageable pageable) {
        return ResponseEntity.ok(eventService.getMyEvents(currentUser.getId(), pageable)); // authenticated == non-null user id
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("@eventService.isOrganizerOrAdmin(#eventId, principal)") // organizer or admin can delete only
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // sending text (data) + media (multipart)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponse> createEvent(@ModelAttribute @Valid EventCreateRequest request, @RequestParam(value = "media", required = false) List<MultipartFile> media, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request, media, currentUser.getId()));
    }

    @PatchMapping(value = "/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // sending text (data) + media (multipart)
    @PreAuthorize("@eventService.isOrganizerOrAdmin(#eventId, principal)") // organizer or admin can delete only
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Integer eventId, @ModelAttribute @Valid EventUpdateRequest request, @RequestParam(value = "media", required = false) List<MultipartFile> media){
        return ResponseEntity.ok().body(eventService.updateEvent(eventId, request, media));
    }

    @PostMapping("/{eventId}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> recordEventView(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser
    ) {
        eventViewService.recordView(eventId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}