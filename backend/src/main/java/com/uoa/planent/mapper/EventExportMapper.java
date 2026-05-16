package com.uoa.planent.mapper;

import com.uoa.planent.dto.event.export.*;
import com.uoa.planent.model.Booking;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.EventTicketType;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

public class EventExportMapper {

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private EventExportMapper() {
        // utility class
    }

    // Bookings are passed in pre-grouped by event id (the service builds the map).
    public static EventsExport toExport(List<Event> events, Map<Integer, List<Booking>> bookingsByEvent) {
        return EventsExport.builder()
                .events(events.stream()
                        .map(e -> toEventExport(e, bookingsByEvent.getOrDefault(e.getId(), List.of())))
                        .toList())
                .build();
    }

    private static EventExport toEventExport(Event event, List<Booking> bookings) {
        return EventExport.builder()
                .eventId("EV" + event.getId())
                .title(event.getTitle())
                .categories(event.getCategories() == null ? List.of()
                        : event.getCategories().stream()
                          .map(ec -> ec.getCategory().getCategoryName())
                          .toList())
                .eventType(event.getEventType())
                .venue(event.getVenue())
                .address(event.getAddress())
                .city(event.getCity())
                .country(event.getCountry())
                .geoLocation(toGeoLocation(event))
                .startDateTime(formatInstant(event.getStartDatetime()))
                .endDateTime(formatInstant(event.getEndDatetime()))
                .capacity(event.getCapacity())
                .ticketTypes(event.getTicketTypes() == null ? List.of()
                        : event.getTicketTypes().stream()
                          .map(EventExportMapper::toTicketTypeExport)
                          .toList())
                .bookings(bookings.stream()
                        .map(EventExportMapper::toBookingExport)
                        .toList())
                .organizer(OrganizerExport.builder()
                        .userId(event.getOrganizer() != null ? event.getOrganizer().getUsername() : null)
                        .build())
                .status(event.getStatus() != null ? event.getStatus().name() : null)
                .description(event.getDescription())
                .media(event.getMedia() == null ? List.of()
                        : event.getMedia().stream()
                          .map(m -> m.getPhotoUrl())
                          .toList())
                .build();
    }

    private static GeoLocationExport toGeoLocation(Event event) {
        if (event.getLatitude() == null || event.getLongitude() == null) {
            return null; // DTD has GeoLocation as optional
        }
        return GeoLocationExport.builder()
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .build();
    }

    private static TicketTypeExport toTicketTypeExport(EventTicketType tt) {
        return TicketTypeExport.builder()
                .ticketTypeId("T" + tt.getId())
                .name(tt.getName())
                .price(tt.getPrice())
                .quantity(tt.getQuantity())
                .available(tt.getAvailable())
                .build();
    }

    private static BookingExport toBookingExport(Booking b) {
        return BookingExport.builder()
                .bookingId("B" + b.getId())
                .attendee(AttendeeExport.builder()
                        .userId(b.getAttendee() != null ? b.getAttendee().getUsername() : null)
                        .build())
                .time(formatInstant(b.getBookingTime()))
                .ticketTypeRef(b.getTicketType() != null ? "T" + b.getTicketType().getId() : null)
                .numberOfTickets(b.getNumberOfTickets())
                .totalCost(b.getTotalCost())
                .bookingStatus(b.getBookingStatus() != null ? b.getBookingStatus().name() : null)
                .build();
    }

    // Database stores Instant (UTC). DTD example uses local-style ISO without timezone:
    // 2025-07-12T20:30:00. Format as UTC LocalDateTime to match.
    private static String formatInstant(Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneOffset.UTC).format(DATETIME_FMT);
    }
}