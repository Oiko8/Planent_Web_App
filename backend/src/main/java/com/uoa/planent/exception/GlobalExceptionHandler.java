package com.uoa.planent.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
// import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {


    // -------------- security & authorization --------------

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Incorrect username or password.");

        return problemDetail;
    }

    @ExceptionHandler(DisabledException.class)
    public ProblemDetail handleDisabledAccount(DisabledException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Account is not yet enabled by an administrator.");

        return problemDetail;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.");

        return problemDetail;
    }





    // -------------- validation & bad requests --------------

    @ExceptionHandler(ValidationException.class)
    public ProblemDetail handleValidationException(ValidationException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());

        return problemDetail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // invalid post (dto) arguments
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid request content.");

        // get error messages from the DTOs
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    // from @NotNull annotations (in services)
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(ConstraintViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // from database null fields that are non-nullable or uniques
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "The request conflicts with database constraints.");
    }

    // database triggers
    @ExceptionHandler(JpaSystemException.class)
    public ProblemDetail handleJpaSystemException(org.springframework.orm.jpa.JpaSystemException e) {
        String detail = "A database constraint prevented this action.";

        if (e.getRootCause() != null) {
            detail = e.getRootCause().getMessage();
        }
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    }

    // file upload size
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail handleMaxSizeException(MaxUploadSizeExceededException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "File size exceeded! Maximum allowed size per file is 5MB.");
    }



    // -------------- domain & service --------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }


    // turn: "Unable to find com.uoa.planent.model.User with id 999" to "User with ID '999' not found."
    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleEntityNotFoundException(EntityNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, cleanHibernateMessage(e.getMessage()));
    }
    private static final Pattern HIBERNATE_ERROR_PATTERN = Pattern.compile("Unable to find .*\\.(\\w+) with id (\\d+)");
    private String cleanHibernateMessage(String message) {
        if (message == null) {
            return "Resource not found.";
        }

        Matcher matcher = HIBERNATE_ERROR_PATTERN.matcher(message);
        if (matcher.find()) {
            String entityName = matcher.group(1); // e.g. User
            String id = matcher.group(2);         // e.g. 999
            return entityName + " with ID '" + id + "' not found.";
        }

        return message; // failsafe
    }



    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNoResourceFound(NoResourceFoundException e, HttpServletRequest request) {

        String detailMessage = "The requested resource could not be found.";
        if (request.getRequestURI().contains("/media/")) {
            detailMessage = "The requested media file could not be found.";
        }

        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, detailMessage);
    }


    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }





    // -------------- web & http layer --------------

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ProblemDetail handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.METHOD_NOT_ALLOWED, "Method " + e.getMethod() + " not supported for this endpoint. Supported methods: " + e.getSupportedHttpMethods());

        return problemDetail;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        String detail = "Malformed JSON request payload.";

        if (e.getMostSpecificCause() != null) {
            String rawMessage = e.getMostSpecificCause().getMessage();

            if (rawMessage != null && rawMessage.contains("out of range")) {
                detail = "The numeric value provided is too large or out of range for this field.";
            } else {
                detail = "Invalid input format or corrupted data structure.";
            }
        }

        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    }




    // -------------- global catch-all fallback --------------

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleAllUnhandledExceptions(Exception e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal server error occurred. Please try again later.");
    }
}