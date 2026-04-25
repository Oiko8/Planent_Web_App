package com.uoa.planent.service;

import com.uoa.planent.dto.event.EventResponse;
import com.uoa.planent.dto.event.EventSearchRequest;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.EventMapper;
import com.uoa.planent.model.Event;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.specification.EventSpecifications;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
            .stream()
            .map(EventMapper::toResponse)
            .toList();
    }

    public EventResponse getEventById(Integer eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        return EventMapper.toResponse(event);
    }



    public Page<EventResponse> searchEvents(EventSearchRequest request, Pageable pageable) {
        if (request.getStartDate() != null && request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())){
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        // dynamically add the filters
        Specification<Event> spec = Specification.where(EventSpecifications.isPublished()); // search for published events only

        if (request.getText() != null && !request.getText().trim().isEmpty()) {
            spec = spec.and(EventSpecifications.hasText(request.getText().trim()));
        }

        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            spec = spec.and(EventSpecifications.inCity(request.getCity().trim()));
        }

        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            spec = spec.and(EventSpecifications.hasCategory(request.getCategory().trim()));
        }

        if (request.getMaxPrice() != null) {
            spec = spec.and(EventSpecifications.hasMaxPrice(request.getMaxPrice()));
        }

        if (request.getStartDate() != null) {
            spec = spec.and(EventSpecifications.startsAfter(request.getStartDate()));
        }

        if (request.getEndDate() != null) {
            spec = spec.and(EventSpecifications.endsBefore(request.getEndDate()));
        }

        // search with the filters added
        // also put the returned events in pages
        Page<Event> eventsPage = eventRepository.findAll(spec, pageable);

        return eventsPage.map(EventMapper::toResponse);
    }
}