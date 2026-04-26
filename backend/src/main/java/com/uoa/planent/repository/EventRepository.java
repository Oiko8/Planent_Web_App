package com.uoa.planent.repository;

import com.uoa.planent.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {
    List<Event> findAllByStatus(Event.EventStatus status);
    Page<Event> findAllByOrganizerId(Integer organizerId, Pageable pageable);
}
