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
import java.util.Set;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // optimized with joins to fetch the ManyToOne relations as well
    @Query(value = "SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "JOIN FETCH tt.event " +
            "WHERE b.attendee.id = :attendeeId",
            countQuery = "SELECT COUNT(b) FROM Booking b WHERE b.attendee.id = :attendeeId")
    Page<Booking> findMyBookingsWithRelations(@Param("attendeeId") Integer attendeeId, Pageable pageable);

    // optimized with joins to fetch the ManyToOne relations as well
    @Query(value = "SELECT b FROM Booking b " +
            "JOIN FETCH b.attendee " +
            "JOIN FETCH b.ticketType tt " +
            "JOIN FETCH tt.event " +
            "WHERE tt.event.id = :eventId",
            countQuery = "SELECT COUNT(b) FROM Booking b WHERE tt.event.id = :eventId")
    Page<Booking> findEventBookingsWithRelations(@Param("eventId") Integer eventId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.ticketType.event.id = :eventId AND b.bookingStatus != 'CANCELLED'")
    List<Booking> findActiveBookingsByEventId(@Param("eventId") Integer eventId);

    boolean existsByTicketType_Event_IdAndAttendee_Id(Integer eventId, Integer userId);
}
