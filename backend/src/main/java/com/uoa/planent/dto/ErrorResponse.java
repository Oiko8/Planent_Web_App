package com.uoa.planent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private final int status; // http status
    private final String message;
    private final long timestamp;
}
