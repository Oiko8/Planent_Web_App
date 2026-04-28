package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.*;
// import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Iterator;
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


    // indirect mapping to bookings
    // Event -> Event Ticket Types -> Booking
    public boolean canBeDeleted() {
        if (this.status == EventStatus.DRAFT) {
            return true;
        } else if (this.status == EventStatus.PUBLISHED) {
            return this.ticketTypes == null || 
                this.ticketTypes.stream().allMatch(tt -> tt.getAvailable().equals(tt.getQuantity()));
        }
        return false;
    }


    // map event to its categories, media and ticket types to avoid querying those tables separately
    // cascade will automatically save any new categories, media or ticket type objects to the corresponding tables (EventMedia, EventCategory, EventTicketType)
    // orphan removal will remove them when the event gets deleted or when they are removed from the set
    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventMedia> media = new LinkedHashSet<>();
    public void addMedia(EventMedia media){
        media.setEvent(this);
        this.media.add(media);
    }
    public void removeMedia(EventMedia media){
        this.media.remove(media);
        media.setEvent(null); // ensure link breaks + help gc
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventCategory> categories = new LinkedHashSet<>();
    public void addCategory(Category category){
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
    public void removeCategory(Category category){
        for (Iterator<EventCategory> iterator = this.categories.iterator(); iterator.hasNext(); ){
            EventCategory eventCategory = iterator.next();

            if (eventCategory.getCategory().getId().equals(category.getId())){
                iterator.remove();
                eventCategory.setEvent(null);
                break;
            }
        }
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventTicketType> ticketTypes = new LinkedHashSet<>();
    public void addTicketType(EventTicketType ticketType){
        ticketType.setEvent(this);
        this.ticketTypes.add(ticketType);
    }
    public void removeTicketType(EventTicketType ticketType){
        this.ticketTypes.remove(ticketType);
        ticketType.setEvent(null);
    }


    // It didn't worl because booking has not field "event"
    // also have a live link only to the bookings
    // @Builder.Default
    // @OneToMany(mappedBy = "event")
    // private Set<Booking> bookings = new LinkedHashSet<>();
}