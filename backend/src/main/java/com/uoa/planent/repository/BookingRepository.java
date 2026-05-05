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
    Page<Booking> findAllByAttendeeId(Integer attendeeId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.ticketType.event.id = :eventId AND b.bookingStatus != 'CANCELLED'")
    List<Booking> findActiveBookingsByEventId(@Param("eventId") Integer eventId);

    boolean existsByTicketType_Event_IdAndAttendee_Id(Integer eventId, Integer userId);
}
