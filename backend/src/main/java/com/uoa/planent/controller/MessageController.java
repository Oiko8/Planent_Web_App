package com.uoa.planent.controller;

import com.uoa.planent.dto.message.MessagePreviewResponse;
import com.uoa.planent.dto.message.MessageResponse;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.MessageService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMessage(@PathVariable Integer messageId, @AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser) {
        return ResponseEntity.ok("todo");
    }

}
