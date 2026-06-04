package com.uoa.planent.repository;

import com.uoa.planent.model.UserRecommendationVector;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRecommendationVectorRepository extends JpaRepository<UserRecommendationVector, Integer> {
}
