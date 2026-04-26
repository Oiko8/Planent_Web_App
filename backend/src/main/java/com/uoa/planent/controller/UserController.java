package com.uoa.planent.controller;

import com.uoa.planent.dto.user.UserResponse;
import com.uoa.planent.dto.user.UserUpdateRequest;
import com.uoa.planent.security.UserDetailsImpl;
import com.uoa.planent.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;


    // by default (from security config), all following endpoints require the user to be authenticated


    // currently authenticated user and admin endpoints

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyUser(@AuthenticationPrincipal(errorOnInvalidType = true) UserDetailsImpl currentUser){
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@userService.isUserOwner(#userId)")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer userId){
        return ResponseEntity.ok(userService.getUserById(userId));
    }


    @PutMapping("/{userId}")
    @PreAuthorize("@userService.isUserOwner(#userId)")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Integer userId, @RequestBody @Valid UserUpdateRequest request){
        return ResponseEntity.ok(userService.updateUser(userId, request));

    }




    // admin only endpoints

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    @PostMapping("/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> approveUser(@PathVariable Integer userId){
        return ResponseEntity.ok(userService.approveUser(userId));
    }

    @DeleteMapping("/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectUser(@PathVariable Integer userId) {
        userService.rejectUser(userId); // deletes the user from the database

        return ResponseEntity.noContent().build();
    }
}
