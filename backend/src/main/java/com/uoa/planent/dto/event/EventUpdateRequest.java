package com.uoa.planent.dto.event;

import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Value
@Builder
@Jacksonized
public class EventUpdateRequest {

    // all fields are optional (nullable) in an update request
    // will update only given fields

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 100, message = "Event title too long")
    String title;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 100, message = "Event type too long")
    String eventType;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 100, message = "Event venue too long")
    String venue;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 50, message = "Event country too long")
    String country;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 50, message = "Event city too long")
    String city;

    @JsonDeserialize(using = TrimDeserializer.class)
    @Size(max = 255, message = "Event address too long")
    String address;

    @Digits(integer = 2, fraction = 8, message = "Event latitude must contain up to 2 integer and 8 decimal digits")
    @DecimalMin(value = "-90.0", message = "Event latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Event latitude must be between -90 and 90")
    BigDecimal latitude;

    @Digits(integer = 3, fraction = 8, message = "Event longitude must contain up to 3 integer and 8 decimal digits")
    @DecimalMin(value = "-180.0", message = "Event longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Event longitude must be between -180 and 180")
    BigDecimal longitude;

    @Future(message = "Event must start in the future")
    Instant startDatetime;

    @Future(message = "Event must end in the future")
    Instant endDatetime;

    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity;

    String description;

    Boolean publish; // false -> DRAFT | true -> PUBLISHED

    Boolean cancel; // false -> does nothing | true -> CANCELLED


    // replaces existing media/categories/ticket types if sent as [] (but doesnt allow [null] or [""] lists)

    @JsonDeserialize(contentUsing = TrimDeserializer.class)
    List<@NotBlank(message = "Media URL cannot be blank") @Size(max = 255) String> mediaUrls;

    List<@NotNull Integer> categoryIds;

    @Valid
    List<@NotNull @Valid TicketTypeRequest> ticketTypes;
}