package com.uoa.planent.repository;

import com.uoa.planent.model.RecommendationConfig;
import org.jspecify.annotations.NonNull;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CachePut;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

// recommendation config is a singleton (single row) in the database
// therefore cache it as well
public interface RecommendationConfigRepository extends JpaRepository<RecommendationConfig, Integer> {

    @Cacheable(value = "configCache", key = "'global_singleton'")
    default @NotNull RecommendationConfig getOrCreateConfig() {
        return findById(1).orElseGet(() -> {
            RecommendationConfig config = new RecommendationConfig(); // default values as per the best config from recommendation.py
            return save(config);
        });
    }

    @Override
    @CachePut(value = "configCache", key = "'global_singleton'")
    <S extends RecommendationConfig> @NonNull S save(@NonNull S entity);
}
