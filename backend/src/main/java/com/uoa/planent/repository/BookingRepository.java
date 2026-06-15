package com.uoa.planent.repository;

import com.uoa.planent.model.Booking;
import com.uoa.planent.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.attendee " +
            "LEFT JOIN FETCH b.ticketType tt " +
            "LEFT JOIN FETCH tt.event " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithRelations(@Param("id") Integer id);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.ticketType tt " +
            "LEFT JOIN FETCH tt.event " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithEvent(@Param("id") Integer id);

    // optimized with joins to fetch the ManyToOne relations as well
    // in order: CONFIRMED -> CANCELLED -> PENDING (same status -> desc time)
    @Query(value = "SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "JOIN FETCH tt.event " +
            "WHERE b.attendee.id = :attendeeId " +
            "ORDER BY CASE b.bookingStatus " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.CONFIRMED THEN 0 " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.CANCELLED THEN 1 " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.PENDING THEN 2 " +
            "  ELSE 3 END ASC, b.bookingTime DESC",
            countQuery = "SELECT COUNT(b) FROM Booking b WHERE b.attendee.id = :attendeeId")
    Page<Booking> findMyBookingsWithRelations(@Param("attendeeId") Integer attendeeId, Pageable pageable);

    // optimized with joins to fetch the ManyToOne relations as well
    // in order: CONFIRMED -> CANCELLED -> PENDING (same status -> desc time)
    @Query(value = "SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "JOIN FETCH tt.event " +
            "WHERE tt.event.id = :eventId " +
            "ORDER BY CASE b.bookingStatus " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.CONFIRMED THEN 0 " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.CANCELLED THEN 1 " +
            "  WHEN com.uoa.planent.model.Booking.BookingStatus.PENDING THEN 2 " +
            "  ELSE 3 END ASC, b.bookingTime DESC",
            countQuery = "SELECT COUNT(b) FROM Booking b JOIN b.ticketType tt WHERE tt.event.id = :eventId")
    Page<Booking> findEventBookingsWithRelations(@Param("eventId") Integer eventId, Pageable pageable);

    // optimized to fetch ManyToOne relations as well
    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "WHERE tt.event.id = :eventId AND b.bookingStatus = com.uoa.planent.model.Booking.BookingStatus.CONFIRMED")
    List<Booking> findActiveBookingsByEventId(@Param("eventId") Integer eventId);

    // optimized to fetch ManyToOne relations as well
    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "JOIN FETCH tt.event")
    List<Booking> findAllForExport();

    boolean existsByIdAndAttendee_Id(Integer bookingId, Integer attendeeId);
    boolean existsByTicketType_Event_IdAndAttendee_Id(Integer eventId, Integer attendeeId);
}
