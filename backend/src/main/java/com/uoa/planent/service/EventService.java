package com.uoa.planent.service;

import com.uoa.planent.dto.event.*;
import com.uoa.planent.event.EventCancelledEvent;
import com.uoa.planent.event.MediaDeleteEvent;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.mapper.EventMapper;
import com.uoa.planent.model.*;
import com.uoa.planent.repository.CategoryRepository;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.UserRepository;
import com.uoa.planent.security.UserDetailsImpl;
import jakarta.annotation.Nullable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import com.uoa.planent.PlanentApplication;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Slf4j
@AllArgsConstructor
@Service
@Validated // null checks
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private final StorageService storageService;

    private final ApplicationEventPublisher eventPublisher;


    public boolean isOrganizerOrAdmin(@NotNull Integer eventId, UserDetailsImpl user) throws ResourceNotFoundException {
        if (user == null) return false; // access denied exception by default if false

        // check if admin
        if (user.isAdmin()) return true;

        // check if organizer
        Integer organizerId = eventRepository.findOrganizerIdById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));
        return organizerId.equals(user.getId());
    }

    // scheduled every 15 mins
    @Scheduled(fixedRate = 900000)
    @Transactional
    @CacheEvict(value = "recommendedEvents", allEntries = true)
    public void completePastEvents() {
        int updatedCount = eventRepository.markPastEventsAsCompleted(Instant.now());
        log.info("Successfully marked {} events as COMPLETED.", updatedCount);
    }


    // returns all recommended (as per the BMF data) non-draft events
    // documentation in EventRepository#findAllRecommendedVisibleEvents
    @Cacheable( // cached exclusively for anonymous guests to maximize performance since they share the most popular events. evicting whenever a event creation/update/deletion happens
            value = "recommendedEvents",
            key = "'guest_page_' + #pageable.pageNumber + '_size_' + #pageable.pageSize",
            condition = "#currentUserId == null"
    )
    public Page<EventSummaryResponse> getAllRecommendedVisibleEvents(@Nullable Integer currentUserId, Pageable pageable) {
        return eventRepository.findAllRecommendedVisibleEvents(currentUserId, pageable).map(EventMapper::toSummaryResponse);
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


    public Page<EventSummaryResponse> getMyEvents(@NotNull Integer organizerId, Pageable pageable){
        return eventRepository.findAllByOrganizerId(organizerId, pageable).map(EventMapper::toSummaryResponse);
    }



    public Page<EventSummaryResponse> searchRecommendedVisibleEvents(EventSearchRequest request, @Nullable Integer currentUserId, Pageable pageable) {
        if (request.getStartDate() != null && request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())){
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        // sanitize and extract the requested statuses (remove draft if included)
        List<Event.EventStatus> statuses;
        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
            statuses = request.getStatuses().stream().filter(s -> s != Event.EventStatus.DRAFT).toList();
        } else {
            // non-draft statuses if none were selected
            statuses = List.of(Event.EventStatus.PUBLISHED, Event.EventStatus.COMPLETED, Event.EventStatus.CANCELLED);
        }

        // safely extract strings
        String text = (request.getText() != null && !request.getText().trim().isEmpty()) ? request.getText().trim() : null;
        String city = (request.getCity() != null && !request.getCity().trim().isEmpty()) ? request.getCity().trim() : null;
        String category = (request.getCategory() != null && !request.getCategory().trim().isEmpty()) ? request.getCategory().trim() : null;

        // native sql search query (handles null values)
        return eventRepository.searchRecommendedVisibleEvents(
                currentUserId,
                statuses,
                text,
                city,
                category,
                request.getMaxPrice(),
                request.getStartDate(),
                request.getEndDate(),
                pageable
        ).map(EventMapper::toSummaryResponse);
    }



    @Transactional
    @CacheEvict(value = "recommendedEvents", allEntries = true)
    public EventResponse createEvent(EventCreateRequest request, List<MultipartFile> media, @NotNull Integer organizerId) {
        // get organizer user
        User organizer = userRepository.findById(organizerId).orElseThrow(() -> new ResourceNotFoundException("User with ID '" + organizerId + "' not found."));

        // create the event's basic info and without status and media/categories/ticket types
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

        // all good so save to database to generate the event's id
        Event savedEvent = eventRepository.save(event);

        // and add media now that we have the event's id
        uploadAndAddMedia(savedEvent, media);

        return EventMapper.toResponse(savedEvent);
    }


    @Transactional
    @CacheEvict(value = "recommendedEvents", allEntries = true)
    public void deleteEvent(Integer eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        event.checkIfDeletable();

        // deletable -> delete media from storage
        List<String> fileUrls = event.getMedia().stream().map(EventMedia::getPhotoUrl).toList();
        eventPublisher.publishEvent(new MediaDeleteEvent(fileUrls));

        eventRepository.delete(event); // cascade ALL and orphan removal will take care of media, categories and ticket types table rows
        // after the transaction (database commit), media files will also be deleted by the listener
    }



    @Transactional
    @CacheEvict(value = "recommendedEvents", allEntries = true)
    public EventResponse updateEvent(Integer eventId, EventUpdateRequest request, List<MultipartFile> media) {
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

        // date
        if (request.getStartDatetime() != null || request.getEndDatetime() != null) {
            event.reschedule(request.getStartDatetime(), request.getEndDatetime()); // handles if one of them is null
        }

        // categories (replace)
        if (request.getCategoryIds() != null) {
            event.getCategories().clear();
            eventRepository.flush();
            addCategories(event, request.getCategoryIds());
        }

        // ticket Types (complex replace)
        if (request.getTicketTypes() != null) {
            updateTicketTypes(event, request.getTicketTypes());
        }

        // status (if both cancel and published are given then an exception will be thrown from publish() or draft())
        if (request.getCancel() != null && request.getCancel()) {
            boolean justCancelled = event.cancel();

            // if event got canceled (first time) then send messages to attendees
            // publishes an async event that runs after a successful commit (save) of this transaction
            if (justCancelled) {
                eventPublisher.publishEvent(new EventCancelledEvent(event.getId()));
            }
        }
        if (request.getPublish() != null){
            if (request.getPublish()){
                event.publish();
            }else{
                event.draft();
            }
        }

        event.validate();
        Event savedEvent = eventRepository.save(event);

        // media (remove or add new) after event is valid
        updateEventMedia(event, request.getMediaUrls(), media);
        return EventMapper.toResponse(savedEvent);
    }


    // Show only the 10 canonical ones in the dropdowns.
    // Legacy categories still in the DB are kept for existing events
    // but won't be selectable for new ones.
    @Cacheable(value = "categories") // caching since categories are static
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> PlanentApplication.CANONICAL_CATEGORIES.contains(c.getCategoryName()))
                // Sort by position in the canonical list — keeps "Other" last.
                .sorted(Comparator.comparingInt(c -> PlanentApplication.CANONICAL_CATEGORIES.indexOf(c.getCategoryName())))
                .map(EventMapper::toCategoryResponse)
                .toList();
    }








    // -------------------------------- helpers --------------------------------

    // add category to event
    private void addCategories(@NotNull Event event, @NotNull List<@NotNull Integer> categoryIds) throws ResourceNotFoundException {
        long requestedIdsCount = categoryIds.stream().distinct().count(); // count distinct sent only

        List<Category> foundCategories = categoryRepository.findAllById(categoryIds);
        if (foundCategories.size() != requestedIdsCount) { // didnt find some ids
            throw new ResourceNotFoundException("One or more categories not found.");
        }
        foundCategories.forEach(event::addCategory); // add them to event (automatically adds event id)
    }


    // add list of media files to event
    // uploads/stores media file and adds it to the media table with its url
    private void uploadAndAddMedia(@NotNull Event event, List<MultipartFile> media) {
        if (media == null || media.isEmpty()) { // no media -> nothing to upload -> all good
            return;
        }

        List<String> uploadedUrls = new ArrayList<>();
        try {
            // upload/store all files
            for (MultipartFile file : media) {
                if (file != null && !file.isEmpty()) {
                    String generatedUrl = storageService.storeWithEventId(file, event.getId());
                    uploadedUrls.add(generatedUrl);
                }
            }

            // add URLs to media table
            addMedia(event, uploadedUrls);

            // save event again
            eventRepository.save(event);

        } catch (Exception e) {
            // if an upload failed, delete already uploaded media files
            log.error("Media processing or final save failed for event ID: {}. Cleaning up already uploaded files...", event.getId(), e);
            uploadedUrls.forEach(storageService::delete);

            // re-throw to rollback transaction (cancel creation)
            throw e;
        }
    }

    // just creates the row with the photo url in the media table
    private void addMedia(@NotNull Event event, @NotNull List<@NotNull String> mediaUrls) {
        mediaUrls.forEach(url -> {
            EventMedia media = new EventMedia();
            media.setPhotoUrl(url);
            event.addMedia(media);
        });
    }

    // requestMediaUrls should contain a subset of the existing media urls, diff of existing-requested will be deleted from the event
    // if none sent (null) -> no changes
    // media contains any new media to be added to the event
    private void updateEventMedia(@NotNull Event event, List<String> requestMediaUrls, List<MultipartFile> media) {
        // if got media urls -> keep only those existing ones
        if (requestMediaUrls != null) {
            // from request urls -> keep only the ones that actually exist in the event (retained)
            List<String> existingUrls = event.getMedia().stream().map(EventMedia::getPhotoUrl).toList();
            List<String> retainedUrls = requestMediaUrls.stream().filter(existingUrls::contains).toList();

            // delete the ones that are not in the retained (diff)
            List<String> urlsToDelete = existingUrls.stream().filter(url -> !retainedUrls.contains(url)).toList();
            if (!urlsToDelete.isEmpty()) {
                eventPublisher.publishEvent(new MediaDeleteEvent(urlsToDelete));
            }

            // re-add retained urls
            event.getMedia().clear();
            addMedia(event, retainedUrls);
        }

        // upload and add any new media
        uploadAndAddMedia(event, media);
    }

    // add list of ticket types to event
    private void addTicketTypes(@NotNull Event event, @NotNull List<@NotNull TicketTypeRequest> ticketTypeRequests) {
        ticketTypeRequests.stream().map(EventMapper::toTicketTypeModel).forEach(event::addTicketType); // event capacity checked during validation
    }

    // update ticket types of event with the given list, if allowed
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
}