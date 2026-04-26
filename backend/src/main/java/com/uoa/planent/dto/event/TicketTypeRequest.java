package com.uoa.planent.dto.event;


import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeRequest {

    @NotBlank(message = "Missing ticket type name")
    @Size(max = 60, message = "Ticket type name too long")
    private String name;

    @NotNull(message = "Missing ticket type price")
    @Digits(integer = 8, fraction = 2, message = "Ticket type price must contain up to 8 integer and 2 decimal digits")
    @DecimalMin(value = "0.0", message = "Ticket type price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Missing ticket type quantity")
    @Min(value = 0, message = "Ticket type quantity cannot be negative")
    private Integer quantity;
}