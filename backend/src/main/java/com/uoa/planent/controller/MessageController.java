package com.uoa.planent.controller;

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

@AllArgsConstructor
@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;


    // ---- authenticated only endpoints ----


    // inbox/sent messages will only show a preview of the message and not mark it as read
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


    // only sender/receiver can view the full message
    // calling this endpoint as the receiver will mark the message as read
    @GetMapping("/{messageId}")
    @PreAuthorize("@messageService.isSenderOrReceiver(#messageId, principal)")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable Integer messageId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messageService.getMessageById(messageId, currentUser.getId()));
    }



    // current user is sender
    // messages can only be sent between attendees - organizers
    @PostMapping
    @PreAuthorize("@messageService.canSendMessage(#request.eventId, #currentUser.id, #request.receiverId)")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody @Valid MessageSendRequest request, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(request, currentUser.getId()));
    }

}
