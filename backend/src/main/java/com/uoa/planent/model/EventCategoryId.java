package com.uoa.planent.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class EventCategoryId implements Serializable {
    private static final long serialVersionUID = -3422959242192223490L;
    @Column(name = "event_id", nullable = false)
    private Integer eventId;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        EventCategoryId entity = (EventCategoryId) o;
        return Objects.equals(this.eventId, entity.eventId) &&
                Objects.equals(this.categoryId, entity.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventId, categoryId);
    }

}