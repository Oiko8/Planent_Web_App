package com.uoa.planent.repository;

import com.uoa.planent.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    // inbox
    Page<Message> findByReceiverIdAndDeletedByReceiverFalse(Integer receiverId, Pageable pageable);

    // sent
    Page<Message> findBySenderIdAndDeletedBySenderFalse(Integer senderId, Pageable pageable);
}
