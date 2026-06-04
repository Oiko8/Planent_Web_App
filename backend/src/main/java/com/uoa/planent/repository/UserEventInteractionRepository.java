package com.uoa.planent.repository;

import com.uoa.planent.model.UserEventInteraction;
import com.uoa.planent.model.UserEventInteractionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserEventInteractionRepository extends JpaRepository<UserEventInteraction, UserEventInteractionId> {
    Optional<UserEventInteraction> findByIdUserIdAndIdEventId(Integer userId, Integer eventId);
}