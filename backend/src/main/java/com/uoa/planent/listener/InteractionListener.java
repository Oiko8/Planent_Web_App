package com.uoa.planent.listener;

import com.uoa.planent.event.BookingConfirmedEvent;
import com.uoa.planent.event.EventViewedEvent;
import com.uoa.planent.repository.UserEventInteractionRepository;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
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
    @Transactional(propagation = Propagation.REQUIRES_NEW) // new transaction since its coming from the createBooking transaction
    public void handleBookingConfirmed(BookingConfirmedEvent payload) {
        recordInteraction(payload.getUserId(), payload.getEventId(), BOOKING_RATING);
    }



    private void recordInteraction(@NotNull Integer userId, @NotNull Integer eventId, @NotNull BigDecimal rating) {
        interactionRepository.upsertInteractionIfNotOrganizer(userId, eventId, rating);
    }
}
