package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "User_Recommendation_Vector")
public class UserRecommendationVector {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bias", nullable = false)
    private Double bias = 0.0;

    @Column(name = "factor1", nullable = false)
    private Double factor1 = Math.random() * 0.1;

    @Column(name = "factor2", nullable = false)
    private Double factor2 = Math.random() * 0.1;

    @Column(name = "factor3", nullable = false)
    private Double factor3 = Math.random() * 0.1;


}