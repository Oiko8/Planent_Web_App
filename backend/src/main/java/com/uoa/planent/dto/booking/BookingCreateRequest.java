package com.uoa.planent.dto.booking;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class BookingCreateRequest {

    @NotNull(message = "Missing ticket type ID.")
    Integer ticketTypeId;

    @NotNull(message = "Missing number of tickets")
    @Min(value = 1, message = "Number of tickets must be at least 1")
    Integer numberOfTickets;
}