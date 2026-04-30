package com.uoa.planent.dto.event;


import com.uoa.planent.annotation.TrimDeserializer;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
public class TicketTypeRequest {

    @JsonDeserialize(using = TrimDeserializer.class)
    @NotBlank(message = "Missing ticket type name")
    @Size(max = 60, message = "Ticket type name too long")
    String name;

    @NotNull(message = "Missing ticket type price")
    @Digits(integer = 8, fraction = 2, message = "Ticket type price must contain up to 8 integer and 2 decimal digits")
    @DecimalMin(value = "0.0", message = "Ticket type price cannot be negative")
    BigDecimal price;

    @NotNull(message = "Missing ticket type quantity")
    @Min(value = 0, message = "Ticket type quantity cannot be negative")
    Integer quantity;

}