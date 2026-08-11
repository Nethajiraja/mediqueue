package com.mediqueue.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Runs before Spring Boot's DataSource auto-configuration.
 *
 * Render provides DATABASE_URL as:
 *   postgresql://user:password@host:port/database
 *
 * Spring Boot / JDBC needs:
 *   jdbc:postgresql://user:password@host:port/database
 *
 * This processor converts the URL and injects it as spring.datasource.url
 * so Spring Boot's standard JPA auto-configuration works normally.
 *
 * Registration: src/main/resources/META-INF/spring.factories
 */
public class RenderDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(RenderDatabaseEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = System.getenv("DATABASE_URL");

        if (databaseUrl == null || databaseUrl.isBlank()) {
            // Not on Render (or DATABASE_URL not set) — use existing application.properties values
            log.debug("DATABASE_URL not set; using application.properties datasource config (local dev)");
            return;
        }

        // Convert postgresql:// → jdbc:postgresql://
        String jdbcUrl = databaseUrl.startsWith("postgresql://")
                ? "jdbc:" + databaseUrl
                : databaseUrl;

        log.info("Render DATABASE_URL detected — overriding spring.datasource.url");

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", jdbcUrl);
        // Username and password are embedded in the URL — clear any placeholder values
        props.put("spring.datasource.username", "");
        props.put("spring.datasource.password", "");

        environment.getPropertySources().addFirst(
                new MapPropertySource("renderDatabaseUrl", props)
        );
    }
}
