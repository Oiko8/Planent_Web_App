package com.uoa.planent.controller;

import com.uoa.planent.dto.message.BroadcastMessageRequest;
import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.dto.message.MessageResponse;
import com.uoa.planent.dto.message.MessageSendRequest;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.MessageService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;


    // ---- authenticated only endpoints ----


    @GetMapping("/inbox")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessagePreviewResponse>> getInboxMessages(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser, Pageable pageable) {
        return ResponseEntity.ok(messageService.getInboxMessages(currentUser.getId(), pageable));
    }

    @GetMapping("/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessagePreviewResponse>> getSentMessages(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser, Pageable pageable) {
        return ResponseEntity.ok(messageService.getSentMessages(currentUser.getId(), pageable));
    }


    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(currentUser.getId())));
    }


    // Broadcast a message to all active attendees of an event.
    // Authorized like the bookings endpoint: only the event's organizer or an admin.
    // Returns the number of recipients so the frontend can show "Sent to N attendees".
    @PostMapping("/broadcast/{eventId}")
    @PreAuthorize("@eventService.isOrganizerOrAdmin(#eventId, principal)")
    public ResponseEntity<Map<String, Integer>> broadcastToEvent(
            @PathVariable Integer eventId,
            @RequestBody @Valid BroadcastMessageRequest request,
            @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser
    ) {
        int recipientCount = messageService.broadcastToEventAttendees(eventId, currentUser.getId(), request.getBody());
        return ResponseEntity.ok(Map.of("recipientCount", recipientCount));
    }


    @GetMapping("/{messageId}")
    @PreAuthorize("@messageService.isSenderOrReceiver(#messageId, principal)")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable Integer messageId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messageService.getMessageById(messageId, currentUser.getId()));
    }

    @PatchMapping("/{messageId}/read")
    @PreAuthorize("@messageService.isSenderOrReceiver(#messageId, principal)") // can only be updated by the receiver, allowing sender as well for frontend simplicity
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Integer messageId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        messageService.markMessageAsRead(messageId, currentUser.getId());

        return ResponseEntity.noContent().build();
    }


    @PostMapping
    @PreAuthorize("@messageService.canSendMessage(#request.eventId, #currentUser.id, #request.receiverId)")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody @Valid MessageSendRequest request, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(request, currentUser.getId()));
    }


    @DeleteMapping("/{messageId}")
    @PreAuthorize("@messageService.isSenderOrReceiver(#messageId, principal)")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer messageId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        messageService.deleteMessage(messageId, currentUser.getId());

        return ResponseEntity.noContent().build();
    }

}