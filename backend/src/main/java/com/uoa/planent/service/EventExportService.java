package com.uoa.planent.service;

import com.uoa.planent.dto.event.export.EventsExport;
import com.uoa.planent.mapper.EventExportMapper;
import com.uoa.planent.model.Booking;
import com.uoa.planent.model.Event;
import com.uoa.planent.repository.BookingRepository;
import com.uoa.planent.repository.EventRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EventExportService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public EventsExport getAllEventsForExport() {
        List<Event> events = eventRepository.findAllForExport();

        // Group all bookings by their event id once, so the mapper can look them up cheaply.
        // (Booking → TicketType → Event is the navigation path; there is no reverse collection.)
        Map<Integer, List<Booking>> bookingsByEvent = bookingRepository.findAllForExport().stream()
                .collect(Collectors.groupingBy(b -> b.getTicketType().getEvent().getId()));

        return EventExportMapper.toExport(events, bookingsByEvent);
    }
}