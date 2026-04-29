package com.uoa.planent.specification;

import com.uoa.planent.model.Category;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.EventCategory;
import com.uoa.planent.model.EventTicketType;
import jakarta.persistence.criteria.Join;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.List;

public class EventSpecifications {

    public static Specification<Event> isVisible() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.notEqual(root.get("status"), Event.EventStatus.DRAFT);
    }

    public static Specification<Event> hasStatuses(@NotEmpty List<Event.EventStatus> statuses) {
        return (root, query, criteriaBuilder) -> root.get("status").in(statuses);
    }

    // checks for given text in both the title and description
    public static Specification<Event> hasText(@NotNull String text){
        return (root, query, criteriaBuilder) -> {
            String likePattern = "%" + text + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern)
            );
        };
    }

    public static Specification<Event> inCity(@NotNull String city) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Event> hasCategory(@NotNull String category) {
        return (root, query, criteriaBuilder) -> {
            // join first on EventCategory (kept in a set in Events)
            Join<Event, EventCategory> eventCategoryJoin = root.join("categories");

            // join finally on Category
            Join<EventCategory, Category> categoryJoin = eventCategoryJoin.join("category");

            return criteriaBuilder.equal(criteriaBuilder.lower(categoryJoin.get("categoryName")), category.toLowerCase());
        };
    }

    public static Specification<Event> hasMaxPrice(@NotNull Double price){
        return (root, query, criteriaBuilder) -> {
            Join<Event, EventTicketType> ticketTypeJoin = root.join("ticketTypes");
            return criteriaBuilder.lessThanOrEqualTo(ticketTypeJoin.get("price"), price);
        };
    }

    public static Specification<Event> startsAfter(@NotNull Instant date) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(root.get("startDatetime"), date);
    }

    public static Specification<Event> endsBefore(@NotNull Instant date) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(root.get("endDatetime"), date);
    }
}
