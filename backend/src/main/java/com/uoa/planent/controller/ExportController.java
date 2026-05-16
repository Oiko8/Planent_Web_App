package com.uoa.planent.controller;

import com.uoa.planent.dto.event.export.EventsExport;
import com.uoa.planent.service.EventExportService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.dataformat.xml.XmlMapper;

@AllArgsConstructor
@RestController
@RequestMapping("/admin/export")
public class ExportController {

    private final EventExportService eventExportService;
    private final JsonMapper jsonMapper;   // auto-configured by Spring Boot 4
    private final XmlMapper xmlMapper;     // from JacksonConfig

    // GET /admin/export/events?format=xml   -> XML attachment
    // GET /admin/export/events?format=json  -> JSON attachment (default)
    @GetMapping("/events")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> exportEvents(@RequestParam(defaultValue = "json") String format) {
        EventsExport data = eventExportService.getAllEventsForExport();

        String body;
        MediaType contentType;
        String filename;

        if ("xml".equalsIgnoreCase(format)) {
            body = xmlMapper.writeValueAsString(data);
            contentType = MediaType.APPLICATION_XML;
            filename = "events-export.xml";
        } else if ("json".equalsIgnoreCase(format)) {
            body = jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
            contentType = MediaType.APPLICATION_JSON;
            filename = "events-export.json";
        } else {
            return ResponseEntity.badRequest()
                    .body("Invalid format. Use 'xml' or 'json'.");
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(body);
    }
}