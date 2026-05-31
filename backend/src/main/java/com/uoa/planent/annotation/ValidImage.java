package com.uoa.planent.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ImageFileValidator.class)
public @interface ValidImage {
    String message() default "Invalid image file. Only JPG, JPEG, and PNG images up to 5MB are allowed.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
