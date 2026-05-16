package com.uoa.planent.dto.event.export;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import tools.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import tools.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import tools.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import java.util.List;

@Value
@Builder
@Jacksonized
@JacksonXmlRootElement(localName = "Events")
public class EventsExport {

    // <Events><Event/>...<Event/></Events> — children of <Events> are <Event> directly, no extra wrapper
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "Event")
    List<EventExport> events;
}