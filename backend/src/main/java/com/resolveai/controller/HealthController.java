package com.resolveai.controller;

import com.resolveai.dto.SystemHealthDto;
import com.resolveai.service.LlmProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "System diagnostic status, database connectivity, and RAG provider telemetry")
public class HealthController {

    private final DataSource dataSource;
    private final LlmProvider llmProvider;

    public HealthController(DataSource dataSource, LlmProvider llmProvider) {
        this.dataSource = dataSource;
        this.llmProvider = llmProvider;
    }

    @GetMapping
    @Operation(summary = "Get system health and service telemetry")
    public ResponseEntity<SystemHealthDto> getHealth() {
        String dbStatus = "DISCONNECTED";
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                dbStatus = "CONNECTED";
            }
        } catch (Exception ignored) {
            // connection failed
        }

        String overallStatus = "CONNECTED".equals(dbStatus) ? "UP" : "DEGRADED";
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;

        SystemHealthDto health = new SystemHealthDto(
                overallStatus,
                dbStatus,
                "AVAILABLE",
                llmProvider.isConfigured() ? "CONFIGURED" : "FALLBACK",
                llmProvider.getProviderName(),
                "1.0.0",
                uptimeSeconds
        );

        return ResponseEntity.ok(health);
    }
}
