package com.uoa.planent.specification;

import com.uoa.planent.model.Category;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.EventCategory;
import com.uoa.planent.model.EventTicketType;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class EventSpecifications {

    public static Specification<Event> isPublished() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), Event.EventStatus.PUBLISHED);
    }

    // checks for given text in both the title and description
    public static Specification<Event> hasText(String text){
        return (root, query, criteriaBuilder) -> {
            String likePattern = "%" + text + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.equal(criteriaBuilder.lower(root.get("description")), likePattern)
            );
        };
    }

    public static Specification<Event> inCity(String city) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Event> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> {
            // join first on EventCategory (kept in a set in Events)
            Join<Event, EventCategory> eventCategoryJoin = root.join("categories");

            // join finally on Category
            Join<EventCategory, Category> categoryJoin = eventCategoryJoin.join("category");

            return criteriaBuilder.equal(criteriaBuilder.lower(categoryJoin.get("categoryName")), category.toLowerCase());
        };
    }

    public static Specification<Event> hasMaxPrice(Double price){
        return (root, query, criteriaBuilder) -> {
            Join<Event, EventTicketType> ticketTypeJoin = root.join("ticketTypes");
            return criteriaBuilder.lessThanOrEqualTo(ticketTypeJoin.get("price"), price);
        };
    }

    public static Specification<Event> startsAfter(Instant date) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(root.get("startDatetime"), date);
    }

    public static Specification<Event> endsBefore(Instant date) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(root.get("endDateTime"), date);
    }
}
