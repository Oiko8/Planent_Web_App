package com.uoa.planent.event;

import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class EventViewedEvent {
    Integer userId;
    Integer eventId;
}
