package com.uoa.planent.dto.event.export;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
@JsonPropertyOrder({"name", "price", "quantity", "available"})
public class TicketTypeExport {

    @JacksonXmlProperty(isAttribute = true, localName = "TicketTypeID")
    String ticketTypeId;

    @JacksonXmlProperty(localName = "Name")
    String name;

    @JacksonXmlProperty(localName = "Price")
    BigDecimal price;

    @JacksonXmlProperty(localName = "Quantity")
    Integer quantity;

    @JacksonXmlProperty(localName = "Available")
    Integer available;
}