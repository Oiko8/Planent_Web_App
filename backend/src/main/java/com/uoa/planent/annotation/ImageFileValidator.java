package com.uoa.planent.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class ImageFileValidator implements ConstraintValidator<ValidImage, MultipartFile> {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/jpg", "image/png");

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        // no file -> considered valid
        if (file == null || file.isEmpty()) {
            return true;
        }

        // must be allowed type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return false;
        }

        return true;
    }
}