package com.uoa.planent.dto.event.export;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
@JsonPropertyOrder({"attendee", "time", "ticketTypeRef", "numberOfTickets", "totalCost", "bookingStatus"})
public class BookingExport {

    @JacksonXmlProperty(isAttribute = true, localName = "BookingID")
    String bookingId;

    @JacksonXmlProperty(localName = "Attendee")
    AttendeeExport attendee;

    @JacksonXmlProperty(localName = "Time")
    String time;

    @JacksonXmlProperty(localName = "TicketTypeRef")
    String ticketTypeRef;

    @JacksonXmlProperty(localName = "NumberOfTickets")
    Integer numberOfTickets;

    @JacksonXmlProperty(localName = "TotalCost")
    BigDecimal totalCost;

    @JacksonXmlProperty(localName = "BookingStatus")
    String bookingStatus;
}