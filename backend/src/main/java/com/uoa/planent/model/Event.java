package com.uoa.planent.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
// import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@Entity
@Table(name = "Event", indexes = {
        @Index(name = "text", columnList = "title, description"),
        @Index(name = "location", columnList = "country, city"),
        @Index(name = "start_datetime", columnList = "start_datetime"),
        @Index(name = "status", columnList = "status")
})
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "venue", nullable = false, length = 100)
    private String venue;

    @Column(name = "country", nullable = false, length = 50)
    private String country;

    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "latitude", nullable = true, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = true, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "start_datetime", nullable = false)
    private Instant startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private Instant endDatetime;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Builder.Default // init correctly when using the builder
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EventStatus status = EventStatus.DRAFT;
    public enum EventStatus {
        DRAFT, PUBLISHED, COMPLETED, CANCELLED
    }

    @Lob
    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;


    // map event to its categories, media and ticket types to avoid querying those tables separately
    // cascade will automatically save any new categories, media or ticket type objects to the corresponding tables (EventMedia, EventCategory, EventTicketType)
    // orphan removal will remove them when the event gets deleted or when they are removed from the set
    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventMedia> media = new LinkedHashSet<>();
    public void addMedia(@NotNull EventMedia media){
        media.setEvent(this);
        this.media.add(media);
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventCategory> categories = new LinkedHashSet<>();
    public void addCategory(@NotNull Category category){
        // add the composite id (key) of the join table
        EventCategoryId eventCategoryId = new EventCategoryId();
        eventCategoryId.setCategoryId(category.getId()); // eventId will be set by Hibernate

        // create the join table's new row now
        EventCategory eventCategory = new EventCategory();
        eventCategory.setId(eventCategoryId);
        eventCategory.setCategory(category);

        eventCategory.setEvent(this);
        this.categories.add(eventCategory);
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventTicketType> ticketTypes = new LinkedHashSet<>();
    public void addTicketType(@NotNull EventTicketType ticketType){
        boolean nameAlreadyExists = this.ticketTypes.stream().anyMatch(existingTicket -> existingTicket.getName().equals(ticketType.getName()));
        if (nameAlreadyExists) {
            throw new IllegalArgumentException("A ticket type with the name '" + ticketType.getName() + "' already exists for this event.");
        }

        ticketType.setEvent(this);
        this.ticketTypes.add(ticketType);
    }
    public void removeTicketType(@NotNull EventTicketType ticketType) throws IllegalStateException {
        if (!this.ticketTypes.contains(ticketType)) {
            return;
        }

        // exists -> allowed to remove?
        if (!ticketType.canBeDeleted()) {
            throw new IllegalStateException("Cannot remove ticket '" + ticketType.getName() + "' because it has bookings.");
        }

        // can remove
        this.ticketTypes.remove(ticketType);
    }





    // ------------- helper and validation methods -------------
    public boolean hasBookings() {
        return this.ticketTypes != null && this.ticketTypes.stream().anyMatch(EventTicketType::hasBookings);
    }
    public boolean canBeDeleted() {
        if (this.status == EventStatus.DRAFT) {
            return true;
        } else if (this.status == EventStatus.PUBLISHED) {
            return !hasBookings();
        }
        return false;
    }

    public void checkIfDeletable() throws IllegalStateException { // gives detailed exceptions on the above false return values
        if (this.status == EventStatus.PUBLISHED) {
            if (hasBookings()){
                throw new IllegalStateException("Cannot delete a published event with active bookings.");
            }
        }else if (this.status == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot delete a cancelled event.");
        }else if (this.status == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot delete a completed event.");
        }
    }


    public void checkIfEditable() throws IllegalStateException {
        if (this.status == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot edit a cancelled event.");
        }else if (this.status == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot edit a completed event.");
        }
    }

    public void checkCanBook() throws IllegalStateException {
        if (status == EventStatus.DRAFT){
            throw new IllegalStateException("Event with ID '" + id + "' is draft.");
        }
        if (status == EventStatus.CANCELLED){
            throw new IllegalStateException("Event with ID '" + id + "' is cancelled.");
        }
        if (status == EventStatus.COMPLETED || endDatetime.isBefore(Instant.now())){
            throw new IllegalStateException("Event with ID '" + id + "' is completed.");
        }
    }

    // only for updating (rescheduling) date times, not for creating/setting
    public void reschedule(@Nullable Instant newStart, @Nullable Instant newEnd) throws IllegalArgumentException {
        newStart = newStart != null ? newStart : this.startDatetime;
        newEnd = newEnd != null ? newEnd : this.endDatetime;

        // start before end date checked in validation

        // if start date changed then it cannot move in the past
        if (!newStart.equals(this.startDatetime)) {
            if (newStart.isBefore(Instant.now())) {
                throw new IllegalArgumentException("The new start time cannot be in the past.");
            }
        }

        // if end date changed then it cannot move in the past
        if (!newEnd.equals(this.endDatetime)) {
            if (newEnd.isBefore(Instant.now())) {
                throw new IllegalArgumentException("The new end time cannot be in the past.");
            }
        }

        this.startDatetime = newStart;
        this.endDatetime = newEnd;
    }

    // publish, cancel and draft only handle checking and changing the status
    public void publish() throws IllegalStateException {
        if (this.status == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot republish a cancelled event.");
        }
        if (this.status == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot republish a completed event.");
        }

        this.status = EventStatus.PUBLISHED;
    }

    // returns true if the event was just cancelled
    // false if it was already cancelled
    public boolean cancel() throws IllegalStateException {
        if (this.status == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed event.");
        }
        if (this.status == EventStatus.DRAFT) {
            throw new IllegalStateException("Cannot cancel a draft event. Request a deletion instead.");
        }

        if (this.status != EventStatus.CANCELLED) {
            this.status = EventStatus.CANCELLED;
            return true;
        }
        return false;
    }

    public void draft() throws IllegalStateException {
        if (this.status == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot draft a cancelled event.");
        }
        if (this.status == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot draft a completed event.");
        }
        if (this.status == EventStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot draft a published event.");
        }

        this.status = EventStatus.DRAFT;
    }



    // state validations to validate entity as a whole after all field updates
    // always call after creating/updating event
    public void validate() throws IllegalArgumentException, IllegalStateException{
        validateDates();
        validateTicketCapacity();
        validateStatus(); // check last
    }
    private void validateDates() {
        if (this.startDatetime.isAfter(this.endDatetime)) {
            throw new IllegalArgumentException("Start date must be before end date.");
        }
        // past dates check in reschedule for updating or creation dto for creating
    }
    private void validateTicketCapacity() throws IllegalStateException {
        if (ticketTypes == null || this.ticketTypes.isEmpty()) return; // may not have tickets yet if draft

        int totalTickets = ticketTypes.stream().mapToInt(EventTicketType::getQuantity).sum();

        if (totalTickets > this.capacity) {
            throw new IllegalStateException("Total tickets (" + totalTickets + ") exceed event capacity (" + this.capacity + ").");
        }
    }
    private void validateStatus() throws IllegalStateException {
        if (this.status == EventStatus.PUBLISHED) {
            if (this.ticketTypes == null || this.ticketTypes.isEmpty()) {
                throw new IllegalStateException("A published event must have at least one ticket type.");
            }
            if (this.categories == null || this.categories.isEmpty()) {
                throw new IllegalStateException("A published event must have at least one category.");
            }
        }
    }
}