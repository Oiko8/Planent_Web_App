package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "User_Event_Interaction", indexes = {
        @Index(name = "fk_User_has_Event_User1_idx",
                columnList = "user_id"),
        @Index(name = "fk_User_has_Event_Event1_idx",
                columnList = "event_id")})
public class UserEventInteraction {
    @EmbeddedId
    private UserEventInteractionId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("eventId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @NotNull
    @Column(name = "rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    public UserEventInteraction(User user, Event event, BigDecimal rating) {
        this.user = user;
        this.event = event;
        this.rating = rating;
        this.id = new UserEventInteractionId(user.getId(), event.getId());
    }
}