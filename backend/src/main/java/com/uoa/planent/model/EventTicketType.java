package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "Event_Ticket_Type", indexes = {
        @Index(name = "fk_Event_TicketType_Event1_idx", columnList = "event_id"),
        @Index(name = "price", columnList = "price")
})
public class EventTicketType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_type_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "available", nullable = false)
    private Integer available;


    public boolean hasBookings() {
        return !Objects.equals(quantity, available);
    }
    public boolean canDelete() {
        return !hasBookings();
    }

    public void updateInfo(@NotNull Integer newQuantity, @NotNull BigDecimal newPrice) throws IllegalArgumentException {
        updateQuantity(newQuantity);
        updatePrice(newPrice);
    }

    public void updateQuantity(@NotNull Integer newQuantity) throws IllegalArgumentException {
        int soldTickets = this.quantity - this.available;
        if (newQuantity < soldTickets) {
            throw new IllegalArgumentException("Cannot reduce quantity below the number of already sold tickets (" + soldTickets + ").");
        }

        this.quantity = newQuantity;
        this.available = newQuantity - soldTickets;
    }

    public void updatePrice(@NotNull BigDecimal newPrice) {
        this.price = newPrice;
    }
}