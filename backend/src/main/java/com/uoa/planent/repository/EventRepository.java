package com.uoa.planent.repository;

import com.uoa.planent.model.Event;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {

    // fetch all events belonging to a specific organizer
    Page<Event> findAllByOrganizerId(Integer organizerId, Pageable pageable);

    // fetch only the organizer id to optimize permission checks without loading heavy objects
    @Query("SELECT e.organizer.id FROM Event e WHERE e.id = :eventId")
    Optional<Integer> findOrganizerIdById(@Param("eventId") Integer eventId);


    // personalized query supporting both guests and authenticated users (BMF algorithm)
    // we dont need the global bias since its a constant
    //
    // sorting hierarchy:
    // 1. event status group: groups by published (1), completed (2) and then cancelled (3)
    // 2. recommendation score: ranks descending for each status group using matrix factorization formula
    // 3. start datetime: nearest start date time when scores are tied
    //
    // fallbacks for the recommendation formula:
    // - anonymous guest path (:userId is null):
    //   the left join on user vector yields null values for all uv columns
    //   coalesce(uv.factorX, 0) converts these nulls to 0.0, neutralizing the dot product multiplication
    //   the formula then safely becomes into just coalesce(ev.bias, 0), which is the event bias
    // - unassigned recommendation vectors (brand new events or new users):
    //   the left joins fail gracefully, producing null values for vector properties
    //   coalesce intercepts these nulls and outputs 0.0
    //   the query just assigns a neutral baseline score of 0.0 to unranked elements
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN UserRecommendationVector uv ON uv.userId = :userId " +
            "LEFT JOIN EventRecommendationVector ev ON ev.eventId = e.id " +
            "WHERE e.status IN (com.uoa.planent.model.Event.EventStatus.PUBLISHED, " +
            "                   com.uoa.planent.model.Event.EventStatus.COMPLETED, " +
            "                   com.uoa.planent.model.Event.EventStatus.CANCELLED) " +
            "ORDER BY CASE e.status " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.PUBLISHED THEN 1 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.COMPLETED THEN 2 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.CANCELLED THEN 3 " +
            "  ELSE 4 END ASC, " +
            "  (COALESCE(ev.bias, 0) + " +
            "   (COALESCE(uv.factor1, 0) * COALESCE(ev.factor1, 0)) + " +
            "   (COALESCE(uv.factor2, 0) * COALESCE(ev.factor2, 0)) + " +
            "   (COALESCE(uv.factor3, 0) * COALESCE(ev.factor3, 0))) DESC, " +
            "  e.startDatetime ASC")
    Page<Event> findAllRecommendedVisibleEvents(@Param("userId") @Nullable Integer userId, Pageable pageable);

    // database search filter with the above recommendation ranking query
    // processes dynamic search parameters natively using null-safe evaluations (AND :parameter IS NULL OR condition)
    // avoiding jpa specifications to integrate the recommendation query directly
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN UserRecommendationVector uv ON uv.userId = :userId " +
            "LEFT JOIN EventRecommendationVector ev ON ev.eventId = e.id " +
            "WHERE e.status IN :statuses " +
            "  AND (:text IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :text, '%')) OR LOWER(CAST(e.description AS string)) LIKE LOWER(CONCAT('%', :text, '%'))) " +
            "  AND (:city IS NULL OR LOWER(e.city) = LOWER(:city)) " +
            "  AND (:category IS NULL OR EXISTS (SELECT 1 FROM e.categories ec WHERE LOWER(ec.category.categoryName) = LOWER(:category))) " +
            "  AND (:maxPrice IS NULL OR EXISTS (SELECT 1 FROM e.ticketTypes tt WHERE tt.price <= :maxPrice)) " +
            "  AND (CAST(:startDate AS timestamp) IS NULL OR e.startDatetime >= :startDate) " +
            "  AND (CAST(:endDate AS timestamp) IS NULL OR e.endDatetime <= :endDate) " +
            "ORDER BY CASE e.status " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.PUBLISHED THEN 1 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.COMPLETED THEN 2 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.CANCELLED THEN 3 " +
            "  ELSE 4 END ASC, " +
            "  (COALESCE(ev.bias, 0) + " +
            "   (COALESCE(uv.factor1, 0) * COALESCE(ev.factor1, 0)) + " +
            "   (COALESCE(uv.factor2, 0) * COALESCE(ev.factor2, 0)) + " +
            "   (COALESCE(uv.factor3, 0) * COALESCE(ev.factor3, 0))) DESC, " +
            "  e.startDatetime ASC")
    Page<Event> searchRecommendedVisibleEvents(
            @Param("userId") @Nullable Integer userId,
            @Param("statuses") @NotNull List<Event.EventStatus> statuses,
            @Param("text") @Nullable String text,
            @Param("city") @Nullable String city,
            @Param("category") @Nullable String category,
            @Param("maxPrice") @Nullable Double maxPrice,
            @Param("startDate") @Nullable Instant startDate,
            @Param("endDate") @Nullable Instant endDate,
            Pageable pageable
    );


    // optimized to fetch ManyToOne relations as well
    @Query("SELECT DISTINCT e FROM Event e JOIN FETCH e.organizer")
    List<Event> findAllForExport();

    @Modifying
    @Query("UPDATE Event e SET e.status = 'COMPLETED' WHERE e.status = 'PUBLISHED' AND e.endDatetime <= :now")
    int markPastEventsAsCompleted(@Param("now") Instant now);
}
