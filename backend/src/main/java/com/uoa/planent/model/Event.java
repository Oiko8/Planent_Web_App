package com.uoa.planent.model;

import jakarta.persistence.*;
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
    public void addMedia(EventMedia media){
        this.media.add(media);
        media.setEvent(this);
    }
    public void removeMedia(EventMedia media){
        this.media.remove(media);
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventCategory> categories = new LinkedHashSet<>();
    public void addCategory(EventCategory category){
        this.categories.add(category);
        category.setEvent(this);
    }
    public void removeCategory(EventCategory category){
        this.categories.remove(category);
    }

    @Builder.Default
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventTicketType> ticketTypes = new LinkedHashSet<>();
    public void addTicketType(EventTicketType ticketType){
        this.ticketTypes.add(ticketType);
        ticketType.setEvent(this);
    }
    public void removeTicketType(EventTicketType ticketType){
        this.ticketTypes.remove(ticketType);
    }

}