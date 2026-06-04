package com.uoa.planent.service;

import com.uoa.planent.model.EventRecommendationVector;
import com.uoa.planent.model.RecommendationConfig;
import com.uoa.planent.model.UserEventInteraction;
import com.uoa.planent.model.UserRecommendationVector;
import com.uoa.planent.repository.EventRecommendationVectorRepository;
import com.uoa.planent.repository.RecommendationConfigRepository;
import com.uoa.planent.repository.UserEventInteractionRepository;
import com.uoa.planent.repository.UserRecommendationVectorRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
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
        log.info("Starting recommendation model training via SGD...");

        // load config (hyperparameters)
        RecommendationConfig config = configRepository.getOrCreateConfig();
        double globalBias = config.getGlobalBias();
        double alpha = config.getLearningRate();    // lr: 0.025
        double lambda = config.getRegularization(); // reg: 0.03
        int epochs = config.getEpochs();            // epochs: 60

        // load all interactions
        List<UserEventInteraction> interactions = interactionRepository.findAll();
        if (interactions.isEmpty()) {
            log.warn("No user interactions found. Training aborted.");
            return;
        }

        // load all user/event vector in a hashmap from the database for fast lookups and updates
        Map<Integer, UserRecommendationVector> userVectorsMap = userVectorRepository.findAll()
                .stream().collect(Collectors.toMap(UserRecommendationVector::getUserId, vector -> vector));

        Map<Integer, EventRecommendationVector> eventVectorsMap = eventVectorRepository.findAll()
                .stream().collect(Collectors.toMap(EventRecommendationVector::getEventId, vector -> vector));


        // start training
        Random random = new Random();
        for (int epoch = 0; epoch < epochs; epoch++) {
            // shuffle interactions to avoid ordering bias in sgd
            Collections.shuffle(interactions);

            for (UserEventInteraction interaction : interactions) {
                Integer userId = interaction.getUser().getId();
                Integer eventId = interaction.getEvent().getId();
                double targetRating = interaction.getRating().doubleValue(); // 0.4 for view, 1.0 for booking

                // get or create user vector in memory using its default values
                UserRecommendationVector userVector = userVectorsMap.computeIfAbsent(userId, id -> {
                    UserRecommendationVector vector = new UserRecommendationVector();
                    vector.setUserId(id);
                    return vector;
                });

                // get or create event vector in memory using its default values
                EventRecommendationVector eventVector = eventVectorsMap.computeIfAbsent(eventId, id -> {
                    EventRecommendationVector vector = new EventRecommendationVector();
                    vector.setEventId(id);
                    return vector;
                });

                // load current biases and factors
                double b_u = userVector.getBias();
                double b_i = eventVector.getBias();

                double p1 = userVector.getFactor1();
                double p2 = userVector.getFactor2();
                double p3 = userVector.getFactor3();

                double q1 = eventVector.getFactor1();
                double q2 = eventVector.getFactor2();
                double q3 = eventVector.getFactor3();

                // step 1: calculate predicted rating with biased matrix factorization formula
                double predictedRating = globalBias + b_u + b_i + (p1 * q1 + p2 * q2 + p3 * q3);

                // step 2: calculate prediction error
                double error = targetRating - predictedRating;

                // step 3: calculate updates for biases and factors using sgd rules
                double delta_b_u = alpha * (error - lambda * b_u);
                double delta_b_i = alpha * (error - lambda * b_i);

                double delta_p1 = alpha * (error * q1 - lambda * p1);
                double delta_p2 = alpha * (error * q2 - lambda * p2);
                double delta_p3 = alpha * (error * q3 - lambda * p3);

                double delta_q1 = alpha * (error * p1 - lambda * q1);
                double delta_q2 = alpha * (error * p2 - lambda * q2);
                double delta_q3 = alpha * (error * p3 - lambda * q3);

                // step 4: update vector states back into the cached memory objects
                userVector.setBias(b_u + delta_b_u);
                eventVector.setBias(b_i + delta_b_i);

                userVector.setFactor1(p1 + delta_p1);
                userVector.setFactor2(p2 + delta_p2);
                userVector.setFactor3(p3 + delta_p3);

                eventVector.setFactor1(q1 + delta_q1);
                eventVector.setFactor2(q2 + delta_q2);
                eventVector.setFactor3(q3 + delta_q3);
            }
        }

        log.info("Writing updated vectors back to the database...");

        userVectorRepository.saveAll(userVectorsMap.values());
        eventVectorRepository.saveAll(eventVectorsMap.values());

        log.info("Recommendation model training completed successfully.");
    }
}
