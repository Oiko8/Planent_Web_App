package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;


// single row only
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Recommendation_Config")
public class RecommendationConfig {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id = 1;

    @Column(name = "global_bias", nullable = false)
    private Double globalBias = 0.0;


}