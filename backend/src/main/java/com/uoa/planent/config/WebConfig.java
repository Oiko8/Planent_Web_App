package com.uoa.planent.config;

import com.uoa.planent.service.FileSystemStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// api endpoint for getting event media images
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.media-folder}")
    private String mediaFolder;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // url endpoint ("/media/**")
        registry.addResourceHandler("/" + mediaFolder + "/**")
                // file folder ("file:media/")
                .addResourceLocations("file:" + mediaFolder + "/");
    }
}
