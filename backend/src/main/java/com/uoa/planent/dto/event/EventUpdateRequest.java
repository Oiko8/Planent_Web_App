package com.uoa.planent.dto.event;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class EventUpdateRequest {

    // all fields are optional (nullable) in an update request
    // will update only given fields

    @Size(max = 100, message = "Event title too long")
    private String title;

    @Size(max = 100, message = "Event type too long")
    private String eventType;

    @Size(max = 100, message = "Event venue too long")
    private String venue;

    @Size(max = 50, message = "Event country too long")
    private String country;

    @Size(max = 50, message = "Event city too long")
    private String city;

    @Size(max = 255, message = "Event address too long")
    private String address;

    @Digits(integer = 2, fraction = 8, message = "Event latitude must contain up to 2 integer and 8 decimal digits")
    @DecimalMin(value = "-90.0", message = "Event latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Event latitude must be between -90 and 90")
    private BigDecimal latitude;

    @Digits(integer = 3, fraction = 8, message = "Event longitude must contain up to 3 integer and 8 decimal digits")
    @DecimalMin(value = "-180.0", message = "Event longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Event longitude must be between -180 and 180")
    private BigDecimal longitude;

    @Future(message = "Event must start in the future")
    private Instant startDatetime;

    @Future(message = "Event must end in the future")
    private Instant endDatetime;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String description;

    private Boolean publish; // false -> DRAFT | true -> PUBLISHED

    private Boolean cancel; // false -> does nothing | true -> CANCELLED


    // replaces existing media/categories/ticket types if sent as [] (but doesnt allow [null] or [""] lists)

    private List<@NotBlank(message = "Media URL cannot be blank") @Size(max = 255) String> mediaUrls;

    private List<@NotNull Integer> categoryIds;

    @Valid
    private List<@NotNull @Valid TicketTypeRequest> ticketTypes;
}