package com.uoa.planent.dto.event.export;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.math.BigDecimal;

@Value
@Builder
@Jacksonized
public class GeoLocationExport {

    @JacksonXmlProperty(isAttribute = true, localName = "Latitude")
    BigDecimal latitude;

    @JacksonXmlProperty(isAttribute = true, localName = "Longitude")
    BigDecimal longitude;
}