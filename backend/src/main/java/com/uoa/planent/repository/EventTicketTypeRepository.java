package com.uoa.planent.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uoa.planent.model.EventTicketType;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTicketTypeRepository extends JpaRepository<EventTicketType, Integer> {

}
