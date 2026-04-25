package com.uoa.planent.service;

import com.uoa.planent.dto.EventResponse;
import com.uoa.planent.mapper.EventMapper;
import com.uoa.planent.repository.EventRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
            .stream()
            .map(EventMapper::toResponse)
            .toList();
    }
}