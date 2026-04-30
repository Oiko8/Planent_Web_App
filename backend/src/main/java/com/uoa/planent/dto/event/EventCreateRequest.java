package com.uoa.planent.dto.event;


import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.annotation.Nullable;
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
public class EventCreateRequest {

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event title")
    @Size(max = 100, message = "Event title too long")
    String title;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event type")
    @Size(max = 100, message = "Event type too long")
    String eventType;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event venue")
    @Size(max = 100, message = "Event venue too long")
    String venue;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event country")
    @Size(max = 50, message = "Event country too long")
    String country;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event city")
    @Size(max = 50, message = "Event city too long")
    String city;

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing event address")
    @Size(max = 255, message = "Event address too long")
    String address;

    @NotNull(message = "Missing event latitude")
    @Digits(integer = 2, fraction = 8, message = "Event latitude must contain up to 2 integer and 8 decimal digits")
    @DecimalMin(value = "-90.0", message = "Event latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Event latitude must be between -90 and 90")
    BigDecimal latitude;

    @NotNull(message = "Missing event longitude")
    @Digits(integer = 3, fraction = 8, message = "Event longitude must contain up to 3 integer and 8 decimal digits")
    @DecimalMin(value = "-180.0", message = "Event longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Event longitude must be between -180 and 180")
    BigDecimal longitude;

    @NotNull(message = "Missing event start date time")
    @Future(message = "Event must start in the future")
    Instant startDatetime;

    @NotNull(message = "Missing event end date time")
    @Future(message = "Event must end in the future")
    Instant endDatetime;

    @NotNull(message = "Missing event capacity")
    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity;

    @NotBlank(message = "Missing event description")
    String description;

    @Builder.Default
    boolean publish = false; // false -> DRAFT | true -> PUBLISHED (default DRAFT)

    @Nullable // optional
    @JsonDeserialize(contentUsing = TrimDeserializer.class)
    List<@NotBlank(message = "Media URL cannot be blank") @Size(max = 255) String> mediaUrls; // if given the list then it cannot be blank

    @NotEmpty(message = "Missing event category IDs")
    List<@NotNull Integer> categoryIds;

    @Valid
    @NotEmpty(message = "Missing event ticket types")
    List<@NotNull @Valid TicketTypeRequest> ticketTypes;
}