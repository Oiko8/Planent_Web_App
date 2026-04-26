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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Integer eventId){
        return ResponseEntity.ok(eventService.getEventById(eventId));
    }


    @GetMapping("/search")
    public ResponseEntity<Page<EventResponse>> searchEvents(@ModelAttribute @Valid EventSearchRequest request, Pageable pageable){
        return ResponseEntity.ok(eventService.searchEvents(request, pageable));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@RequestBody @Valid EventCreateRequest request, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request, currentUser.getId()));
    }



    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllEventCategories() {
        return ResponseEntity.ok(eventService.getAllCategories());
    }

}