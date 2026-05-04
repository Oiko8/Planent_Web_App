package com.uoa.planent.repository;

import com.uoa.planent.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    Page<Booking> findAllByAttendeeId(Integer attendeeId, Pageable pageable);
}
