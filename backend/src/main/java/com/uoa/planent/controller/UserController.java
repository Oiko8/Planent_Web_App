package com.uoa.planent.controller;

import com.uoa.planent.dto.user.UserDataResponse;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDataResponse> getMyUserData(@AuthenticationPrincipal UserDetailsImpl currentUser){
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@userService.isUserOwner(#userId)")
    public ResponseEntity<UserDataResponse> getUserById(@PathVariable Integer userId){
        return ResponseEntity.ok(userService.getUserById(userId));
    }
}
