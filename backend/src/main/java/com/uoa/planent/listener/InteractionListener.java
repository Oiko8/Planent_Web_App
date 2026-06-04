package com.uoa.planent.listener;

import com.uoa.planent.event.BookingConfirmedEvent;
import com.uoa.planent.event.EventViewedEvent;
import com.uoa.planent.exception.ResourceNotFoundException;
import com.uoa.planent.model.Event;
import com.uoa.planent.model.User;
import com.uoa.planent.model.UserEventInteraction;
import com.uoa.planent.repository.EventRepository;
import com.uoa.planent.repository.UserEventInteractionRepository;
import com.uoa.planent.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;

@AllArgsConstructor
@Component
@Validated // null checks
@Transactional(readOnly = true)
public class InteractionListener {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final UserEventInteractionRepository interactionRepository;

    private static final BigDecimal EVENT_VIEW_RATING = BigDecimal.valueOf(0.4);
    private static final BigDecimal BOOKING_RATING = BigDecimal.valueOf(1.0);

    @Async
    @EventListener
    @Transactional
    public void handleEventViewed(EventViewedEvent payload) {
        recordInteraction(payload.getUserId(), payload.getEventId(), EVENT_VIEW_RATING);
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional
    public void handleBookingConfirmed(BookingConfirmedEvent payload) {
        recordInteraction(payload.getUserId(), payload.getEventId(), BOOKING_RATING);
    }



    private void recordInteraction(@NotNull Integer userId, @NotNull Integer eventId, @NotNull BigDecimal rating) {
        interactionRepository.findByIdUserIdAndIdEventId(userId, eventId)
                .ifPresentOrElse( // if it exists -> update it only if the rating is higher
                        interaction -> {
                            if (interaction.getRating().compareTo(rating) < 0) {
                                interaction.setRating(rating);
                                interactionRepository.save(interaction);
                            }
                        },
                        () -> { // if it doesnt exist -> create with given rating
                            User user = userRepository.getReferenceById(userId); // just the reference to add it as the foreign key (avoid querying database)
                            Event event = eventRepository.getReferenceById(eventId);
                            interactionRepository.save(new UserEventInteraction(user, event, rating));
                        }
                );
    }
}
