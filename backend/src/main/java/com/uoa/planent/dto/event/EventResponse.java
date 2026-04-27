package com.uoa.planent.dto.event;

import jakarta.annotation.Nullable;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class EventResponse {
    private Integer eventId;
    private String title;
    private String eventType;
    private String venue;
    private String country;
    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Instant startDatetime;
    private Instant endDatetime;
    private Integer capacity;
    private String status;
    private String description;
    private Integer organizerId;
    private Boolean canDelete;
    @Nullable private List<MediaResponse> media = null;
    private List<CategoryResponse> categories;
    private List<TicketTypeResponse> ticketTypes;
}