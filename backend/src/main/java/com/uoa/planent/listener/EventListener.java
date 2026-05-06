package com.uoa.planent.listener;

import com.uoa.planent.event.EventCancelledEvent;
import com.uoa.planent.model.Booking;
import com.uoa.planent.model.User;
import com.uoa.planent.model.Event;
import com.uoa.planent.repository.BookingRepository;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.service.MessageService;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class EventListener {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final MessageService messageService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleEventCancellation(EventCancelledEvent payload) {
        // get event and organizer
        Event event = eventRepository.findById(payload.getEventId()).orElseThrow();
        User organizer = event.getOrganizer();

        // get the active bookings for this event and also the distinct attendees for the bookings
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByEventId(event.getId());
        Set<User> attendees = activeBookings.stream().map(Booking::getAttendee).collect(Collectors.toSet());

        // cancel all the active bookings
        activeBookings.forEach(Booking::cancel);

        // send all messages
        String body = "NOTICE: The event '" + event.getTitle() + "' has been cancelled by the organizer (" + organizer.getFirstName() + " " + organizer.getLastName() + "). Your booking(s) have been automatically cancelled.";
        messageService.sendBulkMessages(event, organizer, attendees, body);
    }
}