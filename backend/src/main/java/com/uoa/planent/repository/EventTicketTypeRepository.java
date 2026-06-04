package com.uoa.planent.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;

import com.uoa.planent.model.EventTicketType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventTicketTypeRepository extends JpaRepository<EventTicketType, Integer> {
    // gets entity model as well
    // locking row until booking transaction is finished to avoid race conditions
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tt FROM EventTicketType tt LEFT JOIN FETCH tt.event WHERE tt.id = :id")
    Optional<EventTicketType> findByIdWithEventForBooking(@Param("id") Integer id);
}
