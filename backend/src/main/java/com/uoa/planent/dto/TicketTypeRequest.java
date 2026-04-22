package com.uoa.planent.dto;


import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeRequest {
    private String name;
    private BigDecimal price;
    private Integer quantity;
}