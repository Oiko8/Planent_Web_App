package com.uoa.planent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.dataformat.xml.XmlMapper;

// Spring Boot 4 auto-configures a JsonMapper bean (for JSON).
// XmlMapper isn't auto-configured because the dataformat-xml dep is optional.
@Configuration
public class JacksonConfig {

    @Bean
    public XmlMapper xmlMapper() {
        return XmlMapper.builder()
                .enable(SerializationFeature.INDENT_OUTPUT)
                .build();
    }
}