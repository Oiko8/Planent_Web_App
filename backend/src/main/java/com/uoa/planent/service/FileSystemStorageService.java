package com.uoa.planent.service;

import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileSystemStorageService implements StorageService {

    private static final String MEDIA_NAME = "media";
    private static final Path mediaPath = Paths.get(MEDIA_NAME);

    public FileSystemStorageService() {
        // create directory
        try {
            Files.createDirectories(mediaPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory!", e);
        }
    }


    // stores it in: media/{eventId}/{fileName}.jpg
    @Override
    public String storeWithEventId(@NotNull MultipartFile file, @NotNull Integer eventId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        try {
            // create folder for given event id
            Path eventLocation = mediaPath.resolve(String.valueOf(eventId));
            Files.createDirectories(eventLocation);

            // get name of file
            String fileName = file.getOriginalFilename();
            if (fileName == null) {
                fileName = "image.jpg";
            }

            // save to uploads/{eventId}/{fileName}.jpg
            Path destinationFile = eventLocation.resolve(Paths.get(fileName)).normalize().toAbsolutePath();
            file.transferTo(destinationFile);
            return "/media/" + eventId + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file on disk.", e);
        }
    }

    @Override
    public void delete(@NotNull String fileUrl) {
        String prefix = "/" + MEDIA_NAME + "/"; // "/media/"
        if (!fileUrl.startsWith(prefix)) {
            return;
        }

        try {
            // get path after /media/
            String relativePathStr = fileUrl.substring(prefix.length());

            // get full path like media/1/cover1.jpg
            Path fileToDelete = mediaPath.resolve(relativePathStr).normalize().toAbsolutePath();

            // delete now
            boolean fileDeleted = Files.deleteIfExists(fileToDelete);

            // if directory empty -> delete directory
            if (fileDeleted) {
                Path eventFolder = fileToDelete.getParent();
                if (eventFolder != null && Files.exists(eventFolder)) {
                    try (var entries = Files.list(eventFolder)) {
                        if (entries.findFirst().isEmpty()) {
                            Files.delete(eventFolder);
                        }
                    }
                }
            }

        } catch (IOException e) {
            System.err.println("Could not delete file: " + fileUrl + ": " + e.getMessage());
        }
    }
}
