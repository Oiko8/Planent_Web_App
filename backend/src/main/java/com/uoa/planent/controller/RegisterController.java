package com.uoa.planent.controller;


import com.uoa.planent.dto.UserRegisterRequest;
import com.uoa.planent.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
public class RegisterController {

    UserService userService;

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/register")
    public UserRegisterResponse register(@RequestBody @Valid UserRegisterRequest request){

    }

}
