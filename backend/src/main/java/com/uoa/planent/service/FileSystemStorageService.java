package com.uoa.planent.service;

import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileSystemStorageService implements StorageService {

    private final String mediaFolder;
    private final Path mediaPath;

    public FileSystemStorageService(@Value("${app.storage.media-folder}") String mediaFolder) {
        this.mediaFolder = mediaFolder;
        this.mediaPath = Paths.get(mediaFolder);

        // create directory
        try {
            Files.createDirectories(mediaPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory!", e);
        }
    }


    // stores it in: media/{eventId}/{fileName}.{extension}
    @Override
    public String storeWithEventId(@NotNull MultipartFile file, @NotNull Integer eventId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        try {
            // create the subdirectory for given event id (media/{eventId})
            Path eventLocation = mediaPath.resolve(String.valueOf(eventId));
            Files.createDirectories(eventLocation);

            // get the clean filename, stripping any dangerous path traversal sequences (e.g., ../)
            String originalFilename = file.getOriginalFilename();
            String cleanFileName = originalFilename != null && !originalFilename.isBlank() ? Paths.get(originalFilename).getFileName().toString() : "image.jpg";

            // get the absolute save destination path on the file system
            Path destinationFile = eventLocation.resolve(cleanFileName).normalize().toAbsolutePath();

            // if the file already exists -> append a counter (e.g., filename_1.jpg) to prevent overwriting
            if (Files.exists(destinationFile)) {
                String baseName;
                String extension;

                int dotIndex = cleanFileName.lastIndexOf('.');
                if (dotIndex > 0) {
                    baseName = cleanFileName.substring(0, dotIndex);
                    extension = cleanFileName.substring(dotIndex); // Includes the dot (e.g., ".jpg")
                } else {
                    baseName = cleanFileName;
                    extension = "";
                }

                // keep incrementing the counter until a unique filename is found on disk
                int counter = 1;
                while (Files.exists(destinationFile)) {
                    String newFileName = baseName + "_" + counter + extension;
                    destinationFile = eventLocation.resolve(newFileName).normalize().toAbsolutePath();
                    cleanFileName = newFileName;
                    counter++;
                }
            }

            // save the incoming binary file data directly to the path on disk
            file.transferTo(destinationFile);

            return "/" + mediaFolder + "/" + eventId + "/" + cleanFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file on disk.", e);
        }
    }

    @Override
    public void delete(@NotNull String fileUrl) {
        // get the expected path prefix dynamically (e.g., "/media/")
        String prefix = "/" + mediaFolder + "/";
        if (!fileUrl.startsWith(prefix)) {
            return;
        }

        try {
            // get path after prefix (e.g., "12/concert.jpg")
            String relativePathStr = fileUrl.substring(prefix.length());

            // get the safe absolute path to the target file on disk
            Path fileToDelete = mediaPath.resolve(relativePathStr).normalize().toAbsolutePath();

            // delete now
            boolean fileDeleted = Files.deleteIfExists(fileToDelete);
            if (fileDeleted) { // if the file was successfully deleted -> check if its parent directory is now empty
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
