package com.uoa.planent.service;

import com.uoa.planent.repository.EventRecommendationVectorRepository;
import com.uoa.planent.repository.RecommendationConfigRepository;
import com.uoa.planent.repository.UserEventInteractionRepository;
import com.uoa.planent.repository.UserRecommendationVectorRepository;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@AllArgsConstructor
@Service
@Validated // null checks
@Transactional(readOnly = true)
public class RecommendationService {

    private final UserEventInteractionRepository interactionRepository;
    private final UserRecommendationVectorRepository userVectorRepository;
    private final EventRecommendationVectorRepository eventVectorRepository;
    private final RecommendationConfigRepository configRepository;

    @Async
    @Transactional
    public void trainRecommendationModel() {

    }
}
