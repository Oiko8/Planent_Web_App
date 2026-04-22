package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingCreateRequest {
    private Integer ticketTypeId;
    private Integer numberOfTickets;
}