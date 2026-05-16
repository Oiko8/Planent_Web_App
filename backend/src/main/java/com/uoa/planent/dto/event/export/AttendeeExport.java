package com.uoa.planent.dto.event.export;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;

// <Attendee UserID="username"/>
@Value
@Builder
@Jacksonized
public class AttendeeExport {

    @JacksonXmlProperty(isAttribute = true, localName = "UserID")
    String userId;
}