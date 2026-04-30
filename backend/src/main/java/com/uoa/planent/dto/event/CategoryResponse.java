package com.uoa.planent.dto.event;


import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class CategoryResponse {
    Integer categoryId;
    String categoryName;
}