package com.uoa.planent.controller;

import com.uoa.planent.annotation.ValidImage;
import com.uoa.planent.dto.event.*;
import com.uoa.planent.event.EventViewedEvent;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.EventService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
// import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
// import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@Validated
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final ApplicationEventPublisher eventPublisher;


    // Endpoints returning paged event responses return an EventSummaryResponse,
    // which excludes nested lazy fetched sets (categories, media, ticket types) to avoid frontend overfetching.
    // Those are loaded on-demand only when viewing a specific event (getEventById).
    //
    // To eliminate the N+1 query problem during pagination, a global batch fetch size is set (set at 50).
    // For example:
    // - 50 events processed -> 1 main query + 1 batch query for main media.
    // - 51 events processed -> 1 main query + 2 batch queries for main media (due to the size-50 boundary).


    // ---- public endpoints ----

    // returns all recommended (as per the BMF data) non-draft events
    // documentation in EventRepository#findAllRecommendedVisibleEvents
    @GetMapping
    public ResponseEntity<Page<EventSummaryResponse>> getAllRecommendedVisibleEvents(Pageable pageable, @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Integer currentUserId = (currentUser != null) ? currentUser.getId() : null; // null when not signed in
        return ResponseEntity.ok(eventService.getAllRecommendedVisibleEvents(currentUserId, pageable));
    }

    // returns draft events only to the organizer of that event (if authenticated)
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Integer eventId, @AuthenticationPrincipal UserDetailsImpl currentUser){
        Integer currentUserId = (currentUser != null) ? currentUser.getId() : null;
        return ResponseEntity.ok(eventService.getEventById(eventId, currentUserId));
    }


    // searches from all recommended (as per the BMF data) non-draft events
    // documentation in EventRepository#searchRecommendedVisibleEvents
    @GetMapping("/search")
    public ResponseEntity<Page<EventSummaryResponse>> searchRecommendedVisibleEvents(@ModelAttribute @Valid EventSearchRequest request, @AuthenticationPrincipal UserDetailsImpl currentUser, Pageable pageable){
        Integer currentUserId = (currentUser != null) ? currentUser.getId() : null;
        return ResponseEntity.ok(eventService.searchRecommendedVisibleEvents(request, currentUserId, pageable));
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





    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // sending text (request) + media (media)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponse> createEvent(@RequestPart("request") @Valid EventCreateRequest request, @RequestParam(value = "media", required = false) List<@ValidImage MultipartFile> media, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request, media, currentUser.getId()));
    }



    @PatchMapping(value = "/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // sending text (request) + media (media)
    @PreAuthorize("@eventService.isOrganizerOrAdmin(#eventId, principal)") // organizer or admin can delete only
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Integer eventId, @RequestPart("request") @Valid EventUpdateRequest request, @RequestParam(value = "media", required = false) List<@ValidImage MultipartFile> media){
        return ResponseEntity.ok().body(eventService.updateEvent(eventId, request, media));
    }



    // async on interaction listener
    // doesnt record a view if organizer
    @PostMapping("/{eventId}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> recordEventView(@PathVariable Integer eventId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        eventPublisher.publishEvent(new EventViewedEvent(currentUser.getId(), eventId));
        return ResponseEntity.noContent().build();
    }
}