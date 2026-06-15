package com.uoa.planent.repository;

import com.uoa.planent.model.UserEventInteraction;
import com.uoa.planent.model.UserEventInteractionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;


@Repository
public interface UserEventInteractionRepository extends JpaRepository<UserEventInteraction, UserEventInteractionId> {
    Optional<UserEventInteraction> findByIdUserIdAndIdEventId(Integer userId, Integer eventId);

    // upsert (update or create) interaction
    // doesnt allow the event's organizer to interact with it
    @Modifying
    @Query(value = "INSERT INTO user_event_interaction (user_id, event_id, rating) " +
            "SELECT :userId, e.event_id, :rating " +
            "FROM event e " +
            "WHERE e.event_id = :eventId AND e.organizer_id != :userId " +
            "ON DUPLICATE KEY UPDATE rating = GREATEST(rating, :rating)",
            nativeQuery = true)
    int upsertInteractionIfNotOrganizer(@Param("userId") Integer userId, @Param("eventId") Integer eventId, @Param("rating") BigDecimal rating);
}