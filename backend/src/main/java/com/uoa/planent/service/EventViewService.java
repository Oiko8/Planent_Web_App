package com.uoa.planent.service;

import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.EventView;
import com.uoa.planent.model.User;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.EventViewRepository;
import com.uoa.planent.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;

@AllArgsConstructor
@Service
@Validated
@Transactional(readOnly = true)
public class EventViewService {

    private final EventViewRepository eventViewRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public void recordView(@NotNull Integer eventId, @NotNull Integer userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event with ID '" + eventId + "' not found."));

        // organizers of an event are skipped
        if (event.getOrganizer().getId().equals(userId)) {
            return;
        }

        Instant now = Instant.now();

        eventViewRepository.findByUser_IdAndEvent_Id(userId, eventId).ifPresentOrElse(
                existing -> {
                    existing.setLastViewedAt(now);
                    existing.setViewCount(existing.getViewCount() + 1);

                },
                () -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
                    EventView newView = EventView.builder()
                            .user(user)
                            .event(event)
                            .firstViewedAt(now)
                            .lastViewedAt(now)
                            .viewCount(1)
                            .build();
                    eventViewRepository.save(newView);
                }
        );
    }
}