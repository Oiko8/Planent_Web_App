package com.uoa.planent.dto.event;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
public class TicketTypeResponse {
    Integer ticketTypeId;
    String name;
    BigDecimal price;
    Integer quantity;
    Integer available;
}