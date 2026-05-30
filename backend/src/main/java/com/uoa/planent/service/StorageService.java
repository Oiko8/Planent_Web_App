package com.uoa.planent.service;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    // stores file, linking it to an event, and returns its assigned URL
    String storeWithEventId(@NotNull MultipartFile file, @NotNull Integer eventId);

    // delete media using its URL
    void delete(@NotNull String fileUrl);
}
