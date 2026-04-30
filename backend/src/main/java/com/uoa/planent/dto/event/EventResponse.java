package com.uoa.planent.dto.event;

import jakarta.annotation.Nullable;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Value
@Builder
@Jacksonized
public class EventResponse {
    Integer eventId;
    String title;
    String eventType;
    String venue;
    String country;
    String city;
    String address;
    BigDecimal latitude;
    BigDecimal longitude;
    Instant startDatetime;
    Instant endDatetime;
    Integer capacity;
    String status;
    String description;
    Integer organizerId;
    Boolean canDelete;
    @Nullable List<MediaResponse> media;
    List<CategoryResponse> categories;
    List<TicketTypeResponse> ticketTypes;
}