package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@Entity
@Table(name = "EventView",
        uniqueConstraints = {
                @UniqueConstraint(name = "user_event_UNIQUE", columnNames = {"user_id", "event_id"})
        },
        indexes = {
                @Index(name = "fk_EventView_Event_idx", columnList = "event_id")
        })
@NoArgsConstructor
@AllArgsConstructor
public class EventView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "first_viewed_at", nullable = false)
    private Instant firstViewedAt;

    @Column(name = "last_viewed_at", nullable = false)
    private Instant lastViewedAt;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 1;
}