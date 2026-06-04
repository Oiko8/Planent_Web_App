package com.uoa.planent.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;


// single row only (id = 1)
// default (initial) values from best config in
@NoArgsConstructor
@Getter
@Entity
@Table(name = "Recommendation_Config")
public class RecommendationConfig {

    // constant id = 1 (immutable)
    @Id
    @Column(name = "id", nullable = false)
    private Integer id = 1;


    // learnable parameter (mutable)
    @Column(name = "global_bias", nullable = false)
    @Setter
    private Double globalBias = 0.0;



    // ------ HYPERPARAMETERS FROM RECOMMENDATION.PY ------
    // immutable (unless changed in database)

    @Column(name = "learning_rate", nullable = false)
    private Double learningRate = 0.025;

    @Column(name = "regularization", nullable = false)
    private Double regularization = 0.03;

    @Column(name = "epochs", nullable = false)
    private Integer epochs = 60;

    @Column(name = "latent_factors", nullable = false)
    private Integer latentFactors = 3;
}