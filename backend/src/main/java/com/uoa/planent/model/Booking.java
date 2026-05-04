package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.*;
// import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@Entity
@Table(name = "Booking", indexes = {
        @Index(name = "fk_Booking_User1_idx", columnList = "attendee_id"),
        @Index(name = "fk_Booking_Event_TicketType1_idx", columnList = "ticket_type_id")
})
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attendee_id", nullable = false)
    private User attendee;

    @Column(name = "booking_time", nullable = false)
    private Instant bookingTime;

    @ManyToOne
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private EventTicketType ticketType;

    @Column(name = "number_of_tickets", nullable = false)
    private Integer numberOfTickets;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    @Builder.Default
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELLED
    }


    // for a user cancelling a booking
    public void tryCancel() throws IllegalStateException {
        checkCanCancel();
        cancel();
    }

    private void checkCanCancel() throws IllegalStateException {
        if (this.bookingStatus == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        Event event = ticketType.getEvent();
        if (event.getStatus() == Event.EventStatus.CANCELLED){
            throw new IllegalStateException("Cannot manually cancel a booking for a cancelled event");
        }
        if (event.getStatus() == Event.EventStatus.COMPLETED || event.getEndDatetime().isBefore(Instant.now())){
            throw new IllegalStateException("Cannot cancel booking because the event has already completed.");
        }
    }

    // force cancelling a booking (system)
    public void cancel() {
        if (this.bookingStatus != BookingStatus.CANCELLED){
            this.bookingStatus = BookingStatus.CANCELLED;
            ticketType.cancelBooking(this.numberOfTickets);
        }
    }
}