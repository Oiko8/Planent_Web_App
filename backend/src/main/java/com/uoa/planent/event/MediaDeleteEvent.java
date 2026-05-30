package com.uoa.planent.event;

import lombok.AllArgsConstructor;
import lombok.Value;

import java.util.List;

@Value
@AllArgsConstructor
public class MediaDeleteEvent {
    List<String> fileUrls;
}
