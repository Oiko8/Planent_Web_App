package com.uoa.planent.dto.event;


import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class EventCreateRequest {

    @NotBlank(message = "Missing event title")
    @Size(max = 100, message = "Event title too long")
    private String title;

    @NotBlank(message = "Missing event type")
    @Size(max = 100, message = "Event type too long")
    private String eventType;

    @NotBlank(message = "Missing event venue")
    @Size(max = 100, message = "Event venue too long")
    private String venue;

    @NotBlank(message = "Missing event country")
    @Size(max = 50, message = "Event country too long")
    private String country;

    @NotBlank(message = "Missing event city")
    @Size(max = 50, message = "Event city too long")
    private String city;

    @NotBlank(message = "Missing event address")
    @Size(max = 255, message = "Event address too long")
    private String address;

    @NotNull(message = "Missing event latitude")
    @Digits(integer = 2, fraction = 8, message = "Event latitude must contain up to 2 integer and 8 decimal digits")
    @DecimalMin(value = "-90.0", message = "Event latitude must be between -90 and 90") @DecimalMax(value = "90.0", message = "Event latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Missing event longitude")
    @Digits(integer = 3, fraction = 8, message = "Event longitude must contain up to 3 integer and 8 decimal digits")
    @DecimalMin(value = "-180.0", message = "Event longitude must be between -180 and 180") @DecimalMax(value = "180.0", message = "Event longitude must be between -180 and 180")
    private BigDecimal longitude;

    @NotNull(message = "Missing event start date time")
    @Future(message = "Event must start in the future")
    private Instant startDatetime;

    @NotNull(message = "Missing event end date time")
    @Future(message = "Event must end in the future")
    private Instant endDatetime;

    @NotNull(message = "Missing event capacity")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Missing event description")
    private String description;

    @Nullable // optional
    private List<@NotBlank(message = "Media URL cannot be blank") @Size(max = 255) String> mediaUrls;

    @NotEmpty(message = "Missing event category IDs")
    private List<Integer> categoryIds;

    @Valid
    @NotEmpty(message = "Missing event ticket types")
    private List<TicketTypeRequest> ticketTypes;
}