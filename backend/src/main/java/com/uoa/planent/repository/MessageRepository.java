package com.uoa.planent.repository;

import com.uoa.planent.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    // inbox
    Page<Message> findByReceiverIdAndDeletedByReceiverFalseOrderByIdDesc(Integer receiverId, Pageable pageable);

    // sent — same newest-first ordering
    Page<Message> findBySenderIdAndDeletedBySenderFalseOrderByIdDesc(Integer senderId, Pageable pageable);

    // Number of unread messages in the receiver's inbox.
    // Spring Data's `countBy...` runs SELECT COUNT(*) instead of SELECT *.
    long countByReceiverIdAndIsReadFalseAndDeletedByReceiverFalse(Integer receiverId);
}
