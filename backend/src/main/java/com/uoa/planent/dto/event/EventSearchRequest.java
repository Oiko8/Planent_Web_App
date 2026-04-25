package com.uoa.planent.dto.event;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;

@Getter
@Setter
public class EventSearchRequest {

    // all fields are optional (nullable) in an update request
    // will search with given (non-null) criteria only

    @Size(max = 255, message = "Text too long")
    private String text;

    @Size(max = 100, message = "Category too long")
    private String category;

    @Size(max = 50, message = "City too long")
    private String city;

    @Min(value = 0, message = "Max price may not be negative")
    private Double maxPrice;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant endDate;
}
