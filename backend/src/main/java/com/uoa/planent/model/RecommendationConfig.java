package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;


// single row only (id = 1)
// default (initial) values from best config in
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Recommendation_Config")
public class RecommendationConfig {
    @Id
    @Column(name = "id", nullable = false)
    @Builder.Default
    private Integer id = 1;

    @Column(name = "global_bias", nullable = false)
    @Builder.Default
    private Double globalBias = 0.0;

    @Builder.Default
    @Column(name = "learning_rate", nullable = false)
    private Double learningRate = 0.025;

    @Builder.Default
    @Column(name = "regularization", nullable = false)
    private Double regularization = 0.03;

    @Builder.Default
    @Column(name = "epochs", nullable = false)
    private Integer epochs = 60;

    @Builder.Default
    @Column(name = "latent_factors", nullable = false)
    private Integer latentFactors = 3;
}