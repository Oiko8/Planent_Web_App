package com.uoa.planent.repository;

import com.uoa.planent.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;


@Repository
public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {
    Page<Event> findAllByStatus(Event.EventStatus status, Pageable pageable);
    Page<Event> findAllByOrganizerId(Integer organizerId, Pageable pageable);

    // return order: published -> completed -> cancelled (same status orders by closest starting date)
    @Query("SELECT e FROM Event e " +
            "WHERE e.status IN (com.uoa.planent.model.Event.EventStatus.PUBLISHED, " +
            "                   com.uoa.planent.model.Event.EventStatus.COMPLETED, " +
            "                   com.uoa.planent.model.Event.EventStatus.CANCELLED) " +
            "ORDER BY CASE e.status " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.PUBLISHED THEN 1 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.COMPLETED THEN 2 " +
            "  WHEN com.uoa.planent.model.Event.EventStatus.CANCELLED THEN 3 " +
            "  ELSE 4 END, e.startDatetime ASC")
    Page<Event> findAllVisibleEvents(Pageable pageable);

    @Modifying
    @Query("UPDATE Event e SET e.status = 'COMPLETED' WHERE e.status = 'PUBLISHED' AND e.endDatetime <= :now")
    int markPastEventsAsCompleted(@Param("now") Instant now);
}
