package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "Message", indexes = {
        @Index(name = "fk_Message_User1_idx", columnList = "sender_id"),
        @Index(name = "fk_Message_User2_idx", columnList = "receiver_id"),
        @Index(name = "fk_Message_Event1_idx", columnList = "event_id")
})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Lob
    @Column(name = "body", nullable = false)
    private String body;

    @ColumnDefault("0")
    @Column(name = "is_read", nullable = false)
    private Byte isRead;

    @ColumnDefault("0")
    @Column(name = "deleted_by_sender", nullable = false)
    private Byte deletedBySender;

    @ColumnDefault("0")
    @Column(name = "deleted_by_receiver", nullable = false)
    private Byte deletedByReceiver;

}