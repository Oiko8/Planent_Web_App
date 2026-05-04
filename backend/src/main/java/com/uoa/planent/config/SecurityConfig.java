package com.uoa.planent.config;

import com.uoa.planent.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
                // configure server for rest api (stateless)
                .csrf(AbstractHttpConfigurer::disable) // disable csrf since server is stateless
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // cors config
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // stateless server since this is an api that sends jsons

                // unauthenticated api endpoint messages
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        }))

                // api endpoint permissions
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll() // authentication by anyone
                        .requestMatchers(HttpMethod.GET, "/events/my-events").authenticated() // authenticated to get my events
                        .requestMatchers(HttpMethod.GET, "/events/**").permitAll() // other gets are public on events
                        .anyRequest().authenticated()) // all others need authentication

                // authorization
                .authenticationProvider(authenticationProvider) // retrieves user details from the database via the user details service and uses the password encrypter to verify that the provided password and the password on the database match
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // authenticate automatically with a JSON web token
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl)); // allow frontend only
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // for these methods
        config.setAllowedHeaders(List.of("Authorization", "Content-Type")); // with these headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
