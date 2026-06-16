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
    // locking row until booking transaction is finished to avoid race conditions (for creating a booking)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tt FROM EventTicketType tt LEFT JOIN FETCH tt.event WHERE tt.id = :id")
    Optional<EventTicketType> findAndLockByIdWithEvent(@Param("id") Integer id);

    // same logic but without eagerly fetching the event (for cancelling a booking)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tt FROM EventTicketType tt WHERE tt.id = :id")
    Optional<EventTicketType> findAndLockById(@Param("id") Integer id);
}
