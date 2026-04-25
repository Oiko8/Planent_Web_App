package com.uoa.planent.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import com.uoa.planent.dto.CategoryResponse;
import com.uoa.planent.dto.EventResponse;
import com.uoa.planent.dto.TicketTypeResponse;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.EventCategory;
import com.uoa.planent.model.EventTicketType;

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
        
        // convert instant to local date time
        response.setStartDatetime(LocalDateTime.ofInstant(event.getStartDatetime(), ZoneId.systemDefault()));
        response.setEndDatetime(LocalDateTime.ofInstant(event.getEndDatetime(), ZoneId.systemDefault()));

        // map the ticket types
        List<CategoryResponse> categories = event.getCategories().stream()
            .map(EventMapper::toCategoryResponse)
            .toList();
        response.setCategories(categories);

        // map ticket types
        List<TicketTypeResponse> ticketTypes = event.getTicketTypes().stream()
            .map(EventMapper::toTicketTypeResponse)
            .toList();
        response.setTicketTypes(ticketTypes);


        return response;
    }

    private static CategoryResponse toCategoryResponse(EventCategory ec) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(ec.getCategory().getId());
        response.setCategoryName(ec.getCategory().getCategoryName());

        return response;
    }


    private static TicketTypeResponse toTicketTypeResponse(EventTicketType tt) {
        TicketTypeResponse response = new TicketTypeResponse();
        response.setTicketTypeId(tt.getId());
        response.setName(tt.getName());
        response.setPrice(tt.getPrice());
        response.setQuantity(tt.getQuantity());
        response.setAvailable(tt.getAvailable());
        return response;
    }


}
