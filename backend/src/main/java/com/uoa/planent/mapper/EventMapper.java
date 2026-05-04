package com.uoa.planent.mapper;

import java.util.Collections;
import java.util.List;

import com.uoa.planent.dto.event.*;
import com.uoa.planent.model.*;

public class EventMapper {

    public static EventResponse toResponse(Event event){
        if (event == null) return null;

        return EventResponse.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .eventType(event.getEventType())
                .venue(event.getVenue())
                .country(event.getCountry())
                .city(event.getCity())
                .address(event.getAddress())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .capacity(event.getCapacity())
                .status(event.getStatus() != null ? event.getStatus().name() : null)
                .description(event.getDescription())
                .startDatetime(event.getStartDatetime())
                .endDatetime(event.getEndDatetime())
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .canDelete(event.canBeDeleted())
                // mapping nested lists
                .media(event.getMedia() != null ?
                        event.getMedia().stream().map(EventMapper::toMediaResponse).toList() : null)
                .categories(event.getCategories() != null ?
                        event.getCategories().stream().map(ec -> toCategoryResponse(ec.getCategory())).toList() : Collections.emptyList())
                .ticketTypes(event.getTicketTypes() != null ?
                        event.getTicketTypes().stream().map(EventMapper::toTicketTypeResponse).toList() : Collections.emptyList())
                .build();
    }

    public static MediaResponse toMediaResponse(EventMedia media) {
        if (media == null) return null;
        return MediaResponse.builder()
                .mediaId(media.getId())
                .photoUrl(media.getPhotoUrl())
                .build();
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .categoryId(category.getId())
                .categoryName(category.getCategoryName())
                .build();
    }


    public static TicketTypeResponse toTicketTypeResponse(EventTicketType tt) {
        if (tt == null) return null;
        return TicketTypeResponse.builder()
                .ticketTypeId(tt.getId())
                .eventId(tt.getEvent().getId())
                .name(tt.getName())
                .price(tt.getPrice())
                .quantity(tt.getQuantity())
                .available(tt.getAvailable())
                .build();
    }

    public static EventTicketType toTicketTypeModel(TicketTypeRequest request) {
        if (request == null) return null;

        EventTicketType ticketType = new EventTicketType();
        ticketType.setName(request.getName());
        ticketType.setPrice(request.getPrice());
        ticketType.setQuantity(request.getQuantity());
        ticketType.setAvailable(request.getQuantity());
        return ticketType;
    }


}
