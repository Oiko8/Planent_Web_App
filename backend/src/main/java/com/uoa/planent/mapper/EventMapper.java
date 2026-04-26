package com.uoa.planent.mapper;

import java.util.List;

import com.uoa.planent.dto.event.CategoryResponse;
import com.uoa.planent.dto.event.EventResponse;
import com.uoa.planent.dto.event.MediaResponse;
import com.uoa.planent.dto.event.TicketTypeResponse;
import com.uoa.planent.model.*;

public class EventMapper {

    public static EventResponse toResponse(Event event){
        EventResponse response = new EventResponse();
        response.setEventId(event.getId());
        response.setTitle(event.getTitle());
        response.setEventType(event.getEventType());
        response.setVenue(event.getVenue());
        response.setCountry(event.getCountry());
        response.setCity(event.getCity());
        response.setAddress(event.getAddress());
        response.setLatitude(event.getLatitude());
        response.setLongitude(event.getLongitude());
        response.setCapacity(event.getCapacity());
        response.setStatus(event.getStatus().name());
        response.setDescription(event.getDescription());
        response.setStartDatetime(event.getStartDatetime());
        response.setEndDatetime(event.getEndDatetime());
        response.setOrganizerId(event.getOrganizer().getId());


        // map media
        if (event.getMedia() != null){
            List<MediaResponse> media = event.getMedia().stream()
                    .map(EventMapper::toMediaResponse)
                    .toList();
            response.setMedia(media);
        }

        // map categories
        List<CategoryResponse> categories = event.getCategories().stream()
            .map(ec -> EventMapper.toCategoryResponse(ec.getCategory()))
            .toList();
        response.setCategories(categories);

        // map ticket types
        List<TicketTypeResponse> ticketTypes = event.getTicketTypes().stream()
            .map(EventMapper::toTicketTypeResponse)
            .toList();
        response.setTicketTypes(ticketTypes);


        return response;
    }

    public static MediaResponse toMediaResponse(EventMedia media) {
        MediaResponse response = new MediaResponse();
        response.setMediaId(media.getId());
        response.setPhotoUrl(media.getPhotoUrl());

        return response;
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getId());
        response.setCategoryName(category.getCategoryName());

        return response;
    }


    public static TicketTypeResponse toTicketTypeResponse(EventTicketType tt) {
        TicketTypeResponse response = new TicketTypeResponse();
        response.setTicketTypeId(tt.getId());
        response.setName(tt.getName());
        response.setPrice(tt.getPrice());
        response.setQuantity(tt.getQuantity());
        response.setAvailable(tt.getAvailable());
        return response;
    }


}
