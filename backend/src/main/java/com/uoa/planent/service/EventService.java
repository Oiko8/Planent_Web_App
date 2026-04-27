package com.uoa.planent.service;

import com.uoa.planent.dto.event.*;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.EventMapper;
import com.uoa.planent.model.*;
import com.uoa.planent.repository.CategoryRepository;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.UserRepository;
import com.uoa.planent.specification.EventSpecifications;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<EventResponse> getAllPublishedEvents() {
        return eventRepository.findAllByStatus(Event.EventStatus.PUBLISHED)
            .stream()
            .map(EventMapper::toResponse)
            .toList();
    }

    public EventResponse getEventById(Integer eventId, @Nullable Integer currentUserId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        // if its a draft event, return it only if the current user is the organizer
        if (event.getStatus() == Event.EventStatus.DRAFT) {
            if (currentUserId == null || !event.getOrganizer().getId().equals(currentUserId)){
                throw new ResourceNotFoundException("Event with ID '" + eventId + "' not found.");
            }
        }

        return EventMapper.toResponse(event);
    }


    public Page<EventResponse> getMyEvents(Integer organizerId, Pageable pageable){
        return eventRepository.findAllByOrganizerId(organizerId, pageable).map(EventMapper::toResponse);
    }



    public Page<EventResponse> searchPublishedEvents(EventSearchRequest request, Pageable pageable) {
        if (request.getStartDate() != null && request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())){
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        // dynamically add the filters
        Specification<Event> spec = Specification.where(EventSpecifications.isPublished()); // published events only

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



    @Transactional
    public EventResponse createEvent(EventCreateRequest request, Integer organizerId) {
        // data checking
        if (request.getStartDatetime().isAfter(request.getEndDatetime())){
            throw new IllegalArgumentException("End date must be after start date");
        }

        int totalTickets = request.getTicketTypes().stream().mapToInt(TicketTypeRequest::getQuantity).sum();
        if (totalTickets > request.getCapacity()){
            throw new IllegalArgumentException("Total number of tickets cannot exceed the event's capacity");
        }

        // get organizer user
        User organizer = userRepository.findById(organizerId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + organizerId + "' not found."));


        // create the event without media/categories/media
        Event event = Event.builder()
                .title(request.getTitle())
                .eventType(request.getEventType())
                .venue(request.getVenue())
                .city(request.getCity())
                .country(request.getCountry())
                .address(request.getAddress())
                // just for testing
                .latitude(request.getLatitude() != null ? request.getLatitude() : BigDecimal.ZERO)
                .longitude(request.getLongitude() != null ? request.getLongitude() : BigDecimal.ZERO)
                // .latitude(request.getLatitude())
                // .longitude(request.getLongitude())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .organizer(organizer)
                .status(Event.EventStatus.DRAFT)
                .build();

        // add them now
        // media (optional)
        if (request.getMediaUrls() != null){
            request.getMediaUrls().forEach(url -> {
                EventMedia media = new EventMedia();
                media.setPhotoUrl(url);
                event.addMedia(media); // automatically adds event id
            });
        }

        // categories
        request.getCategoryIds().forEach(categoryId -> {
            Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new ResourceNotFoundException("Category with ID '" + categoryId + "' not found."));

            EventCategory eventCategory = new EventCategory();
            eventCategory.setCategory(category);
            event.addCategory(eventCategory);
        });

        // ticket types
        request.getTicketTypes().forEach(ticketTypeRequest -> {
            EventTicketType ticketType = new EventTicketType();
            ticketType.setName(ticketTypeRequest.getName());
            ticketType.setPrice(ticketTypeRequest.getPrice());
            ticketType.setQuantity(ticketTypeRequest.getQuantity());
            ticketType.setAvailable(ticketTypeRequest.getQuantity());
            event.addTicketType(ticketType);
        });

        Event savedEvent = eventRepository.save(event);

        return EventMapper.toResponse(savedEvent);
    }


    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
            .stream()
            .map(EventMapper::toCategoryResponse)
            .toList();
    }
}