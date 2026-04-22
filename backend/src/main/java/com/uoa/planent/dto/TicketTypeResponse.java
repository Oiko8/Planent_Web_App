package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeResponse {
    private Integer ticketTypeId;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private Integer available;
}