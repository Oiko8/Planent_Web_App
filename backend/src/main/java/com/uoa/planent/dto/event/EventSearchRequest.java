package com.uoa.planent.dto.event;

import com.uoa.planent.model.Event;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;
import java.util.List;

@Value
@Builder
@Jacksonized
public class EventSearchRequest {

    // all fields are optional (nullable) in an update request
    // will search with given (non-null) criteria only

    List<Event.@NotNull(message = "Status cannot be null") EventStatus> statuses;

    @Size(max = 255, message = "Text too long")
    String text;

    @Size(max = 100, message = "Category too long")
    String category;

    @Size(max = 50, message = "City too long")
    String city;

    @Min(value = 0, message = "Max price may not be negative")
    Double maxPrice;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    Instant startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    Instant endDate;
}
