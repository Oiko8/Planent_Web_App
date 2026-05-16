package com.uoa.planent.dto.event.export;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.util.List;

@Value
@Builder
@Jacksonized
// Element order has to match the DTD exactly (Title, Category+, EventType, ...)
@JsonPropertyOrder({
        "title", "categories", "eventType", "venue", "address", "city", "country",
        "geoLocation", "startDateTime", "endDateTime", "capacity",
        "ticketTypes", "bookings", "organizer", "status", "description", "media"
})
public class EventExport {

    @JacksonXmlProperty(isAttribute = true, localName = "EventID")
    String eventId;

    @JacksonXmlProperty(localName = "Title")
    String title;

    // <Category>...</Category> repeats directly inside <Event> — no wrapper
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "Category")
    List<String> categories;

    @JacksonXmlProperty(localName = "EventType")
    String eventType;

    @JacksonXmlProperty(localName = "Venue")
    String venue;

    @JacksonXmlProperty(localName = "Address")
    String address;

    @JacksonXmlProperty(localName = "City")
    String city;

    @JacksonXmlProperty(localName = "Country")
    String country;

    // GeoLocation is "GeoLocation?" in the DTD — emit only when present
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JacksonXmlProperty(localName = "GeoLocation")
    GeoLocationExport geoLocation;

    @JacksonXmlProperty(localName = "StartDateTime")
    String startDateTime;

    @JacksonXmlProperty(localName = "EndDateTime")
    String endDateTime;

    @JacksonXmlProperty(localName = "Capacity")
    Integer capacity;

    // <TicketTypes><TicketType .../>...</TicketTypes> — wrapper IS used
    @JacksonXmlElementWrapper(localName = "TicketTypes")
    @JacksonXmlProperty(localName = "TicketType")
    List<TicketTypeExport> ticketTypes;

    // <Bookings><Booking .../>...</Bookings> — wrapper IS used; required in DTD even when empty
    @JacksonXmlElementWrapper(localName = "Bookings")
    @JacksonXmlProperty(localName = "Booking")
    List<BookingExport> bookings;

    @JacksonXmlProperty(localName = "Organizer")
    OrganizerExport organizer;

    @JacksonXmlProperty(localName = "Status")
    String status;

    @JacksonXmlProperty(localName = "Description")
    String description;

    // Media is "Media?" — omit when no photos
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JacksonXmlElementWrapper(localName = "Media")
    @JacksonXmlProperty(localName = "Photo")
    List<String> media;
}