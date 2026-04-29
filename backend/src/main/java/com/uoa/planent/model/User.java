package com.uoa.planent.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@Entity
@Table(name = "User", uniqueConstraints = {
        @UniqueConstraint(name = "username_UNIQUE", columnNames = {"username"})
})
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Builder.Default
    @Column(name = "is_admin", columnDefinition = "TINYINT(1)", nullable = false)
    private Boolean isAdmin = false;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "is_approved", columnDefinition = "TINYINT(1)", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "country", nullable = false, length = 50)
    private String country;

    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "zipcode", nullable = false, length = 20)
    private String zipcode;

    @Column(name = "latitude", nullable = true, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = true, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "afm", nullable = false, length = 9)
    private String afm;

    @Builder.Default
    @OneToMany(mappedBy = "attendee")
    private Set<Booking> bookings = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "organizer")
    private Set<Event> events = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "sender")
    private Set<Message> sentMessages = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "receiver")
    private Set<Message> receivedMessages = new LinkedHashSet<>();
}