package com.uoa.planent.repository;

import com.uoa.planent.model.EventView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventViewRepository extends JpaRepository<EventView, Integer> {
    Optional<EventView> findByUser_IdAndEvent_Id(Integer userId, Integer eventId);
}