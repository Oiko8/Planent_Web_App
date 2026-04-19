package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Event_Category", indexes = {
        @Index(name = "fk_Event_has_Category_Event1_idx", columnList = "event_id"),
        @Index(name = "fk_Event_has_Category_Category1_idx", columnList = "category_id")
})
public class EventCategory {
    @EmbeddedId
    private EventCategoryId id;

    @MapsId("eventId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @MapsId("categoryId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

}