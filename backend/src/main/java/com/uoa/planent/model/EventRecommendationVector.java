package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Event_Recommendation_Vector")
public class EventRecommendationVector {
    @Id
    @Column(name = "event_id", nullable = false)
    private Integer eventId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "bias", nullable = false)
    private Double bias = 0.0;

    @Column(name = "factor1", nullable = false)
    private Double factor1 = Math.random() * 0.1;

    @Column(name = "factor2", nullable = false)
    private Double factor2 = Math.random() * 0.1;

    @Column(name = "factor3", nullable = false)
    private Double factor3 = Math.random() * 0.1;


}