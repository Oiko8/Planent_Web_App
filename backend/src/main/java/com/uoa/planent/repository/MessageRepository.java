package com.uoa.planent.repository;

import com.uoa.planent.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT CASE WHEN (COUNT(m) > 0) THEN true ELSE false END FROM Message m WHERE m.id = :id AND (m.sender.id = :uid OR m.receiver.id = :uid)")
    boolean existsByIdAndSenderOrReceiver(@Param("id") Integer id, @Param("uid") Integer uid);

    // inbox (optimized with joins to fetch the ManyToOne relations as well)
    @Query(value = "SELECT m FROM Message m " +
            "JOIN FETCH m.sender " +
            "LEFT JOIN FETCH m.event " +
            "WHERE m.receiver.id = :receiverId AND m.deletedByReceiver = false",
            countQuery = "SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.deletedByReceiver = false")
    Page<Message> findInboxWithRelations(@Param("receiverId") Integer receiverId, Pageable pageable);

    // sent (optimized with joins to fetch the ManyToOne relations as well)
    @Query(value = "SELECT m FROM Message m " +
            "JOIN FETCH m.receiver " +
            "LEFT JOIN FETCH m.event " +
            "WHERE m.sender.id = :senderId AND m.deletedBySender = false",
            countQuery = "SELECT COUNT(m) FROM Message m WHERE m.sender.id = :senderId AND m.deletedBySender = false")
    Page<Message> findSentWithRelations(@Param("senderId") Integer senderId, Pageable pageable);


    @Query("SELECT m FROM Message m " +
            "JOIN FETCH m.sender " +
            "JOIN FETCH m.receiver " +
            "LEFT JOIN FETCH m.event " +
            "WHERE m.id = :id")
    Optional<Message> findByIdWithRelations(@Param("id") Integer id);

    // Number of unread messages in the receiver's inbox.
    // Spring Data's `countBy...` runs SELECT COUNT(*) instead of SELECT *.
    long countByReceiverIdAndIsReadFalseAndDeletedByReceiverFalse(Integer receiverId);
}
