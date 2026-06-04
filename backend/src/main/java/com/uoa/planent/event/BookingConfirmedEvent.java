package com.uoa.planent.event;

import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class BookingConfirmedEvent {
    Integer userId;
    Integer eventId;
}
