package com.uoa.planent.service;

import com.uoa.planent.dto.event.*;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.EventMapper;
import com.uoa.planent.model.*;
import com.uoa.planent.repository.CategoryRepository;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.UserRepository;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.specification.EventSpecifications;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Slf4j
@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;


    public boolean isOrganizerOrAdmin(Integer eventId, UserDetailsImpl user) throws ResourceNotFoundException {
        if (user == null) return false; // access denied exception by default if false

        // check if admin
        boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> Objects.equals(a.getAuthority(), "ADMIN"));
        if (isAdmin) return true;

        // check if organizer
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return event.getOrganizer().getId().equals(user.getId());
    }

    // scheduled every 15 mins
    @Scheduled(fixedRate = 900000)
    @Transactional
    public void completePastEvents() {
        int updatedCount = eventRepository.markPastEventsAsCompleted(Instant.now());
        log.info("Successfully marked {} events as COMPLETED.", updatedCount);
    }


    // returns all non-draft events
    public Page<EventResponse> getAllVisibleEvents(Pageable pageable) {
        return eventRepository.findAllVisibleEvents(pageable).map(EventMapper::toResponse);
    }

    public EventResponse getEventById(Integer eventId, @Nullable Integer currentUserId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        // if its a draft event, return it only if the current user is the organizer
        if (event.getStatus() == Event.EventStatus.DRAFT) {
            if (!event.getOrganizer().getId().equals(currentUserId)){
                throw new ResourceNotFoundException("Event with ID '" + eventId + "' not found.");
            }
        }

        return EventMapper.toResponse(event);
    }


    public Page<EventResponse> getMyEvents(@NotNull Integer organizerId, Pageable pageable){
        return eventRepository.findAllByOrganizerId(organizerId, pageable).map(EventMapper::toResponse);
    }



    public Page<EventResponse> searchVisibleEvents(EventSearchRequest request, Pageable pageable) {
        if (request.getStartDate() != null && request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())){
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        // dynamically add the filters
        Specification<Event> spec = Specification.where(EventSpecifications.isVisible()); // start with visible events

        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
            // remove draft if given
            List<Event.EventStatus> filteredStatuses = request.getStatuses().stream().filter(s -> s != Event.EventStatus.DRAFT).toList();
            if (!filteredStatuses.isEmpty()){
                spec = spec.and(EventSpecifications.hasStatuses(filteredStatuses));
            }
        }

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

        // sort the pageable to always show first PUBLISHED -> COMPLETED -> CANCELLED
        // and then add any secondary criteria given by the user (date, price asc/desc etc...)
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "status")
                        .and(pageable.getSort())
        );

        // search with the filters added and return events in our sorted pages
        return eventRepository.findAll(spec, sortedPageable).map(EventMapper::toResponse);
    }



    @Transactional
    public EventResponse createEvent(EventCreateRequest request, @NotNull Integer organizerId) {
        // get organizer user
        User organizer = userRepository.findById(organizerId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + organizerId + "' not found."));

        // create the event basic info and without status and media/categories/ticket types
        Event event = Event.builder()
                .title(request.getTitle())
                .eventType(request.getEventType())
                .venue(request.getVenue())
                .city(request.getCity())
                .country(request.getCountry())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .organizer(organizer)
                .build();

        // add them now

        // media (optional)
        if (request.getMediaUrls() != null){
            addMedia(event, request.getMediaUrls());
        }

        // categories
        addCategories(event, request.getCategoryIds());

        // ticket types
        addTicketTypes(event, request.getTicketTypes());


        // status (throws exceptions)
        if (request.isPublish()){
            event.publish();
        }else{
            event.draft();
        }


        // validate that everything given is correct
        event.validate();

        // all good so save to database
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toResponse(savedEvent);
    }


    @Transactional
    public void deleteEvent(Integer eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        event.checkIfDeletable();

        eventRepository.delete(event); // cascade ALL and orphan removal will take care of media, categories and ticket types
    }



    @Transactional
    public EventResponse updateEvent(Integer eventId, EventUpdateRequest request) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        event.checkIfEditable();

        // update only the non-null (given) fields

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getEventType() != null) event.setEventType(request.getEventType());
        if (request.getVenue() != null) event.setVenue(request.getVenue());
        if (request.getCountry() != null) event.setCountry(request.getCountry());
        if (request.getCity() != null) event.setCity(request.getCity());
        if (request.getAddress() != null) event.setAddress(request.getAddress());
        if (request.getLatitude() != null) event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) event.setLongitude(request.getLongitude());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getCapacity() != null) event.setCapacity(request.getCapacity());
        if (request.getStartDatetime() != null) event.setStartDatetime(request.getStartDatetime());
        if (request.getEndDatetime() != null) event.setEndDatetime(request.getEndDatetime());

        // categories (replace)
        if (request.getCategoryIds() != null) {
            event.getCategories().clear();
            addCategories(event, request.getCategoryIds());
        }

        // media (replace)
        if (request.getMediaUrls() != null) {
            event.getMedia().clear();
            addMedia(event, request.getMediaUrls());
        }

        // ticket Types (complex replace)
        if (request.getTicketTypes() != null) {
            updateTicketTypes(event, request.getTicketTypes());
        }

        // status (if both cancel and published are given then an exception will be thrown from publish() or draft())
        if (request.getCancel() != null && request.getCancel()) event.cancel();
        if (request.getPublish() != null){
            if (request.getPublish()){
                event.publish();
            }else{
                event.draft();
            }
        }

        event.validate();
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toResponse(savedEvent);
    }





    private void addCategories(@NotNull Event event, @NotNull List<@NotNull Integer> categoryIds) throws ResourceNotFoundException {
        long requestedIdsCount = categoryIds.stream().distinct().count(); // count distinct sent only

        List<Category> foundCategories = categoryRepository.findAllById(categoryIds);
        if (foundCategories.size() != requestedIdsCount) { // didnt find some ids
            throw new ResourceNotFoundException("One or more categories not found.");
        }
        foundCategories.forEach(event::addCategory); // add them to event (automatically adds event id)
    }

    private void addMedia(@NotNull Event event, @NotNull List<@NotNull String> mediaUrls) {
        mediaUrls.forEach(url -> {
            EventMedia media = new EventMedia();
            media.setPhotoUrl(url);
            event.addMedia(media);
        });
    }

    private void addTicketTypes(@NotNull Event event, @NotNull List<@NotNull TicketTypeRequest> ticketTypeRequests) {
        ticketTypeRequests.stream().map(EventMapper::toTicketTypeModel).forEach(event::addTicketType); // event capacity checked during validation
    }

    private void updateTicketTypes(@NotNull Event event, @NotNull List<@NotNull TicketTypeRequest> ticketTypeRequests) {
        // remove existing ticket types that are not in the requested only if they dont have bookings already
        List<EventTicketType> ticketsToRemove = event.getTicketTypes().stream()
                .filter(existing -> ticketTypeRequests.stream().noneMatch(request -> request.getName().trim().equals(existing.getName())))
                .toList();
        for (EventTicketType existing : ticketsToRemove) {
            event.removeTicketType(existing); // checks bookings
        }

        // update or add new ticket types (capacity check in validation)
        for (TicketTypeRequest request : ticketTypeRequests) {
            event.getTicketTypes().stream()
                    .filter(existing -> existing.getName().equals(request.getName().trim()))
                    .findFirst()
                    .ifPresentOrElse(
                            // exists -> update
                            existing -> existing.updateInfo(request.getQuantity(), request.getPrice()), // checks quantity/price

                            // doesnt exist -> add
                            () -> event.addTicketType(EventMapper.toTicketTypeModel(request)));
        }
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(EventMapper::toCategoryResponse).toList();
    }
}