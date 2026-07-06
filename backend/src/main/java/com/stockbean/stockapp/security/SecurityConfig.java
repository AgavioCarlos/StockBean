package com.stockbean.stockapp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtRequestFilter jwtRequestFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                // ⬇️ HABILITA CORS dentro de la cadena de filtros
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ⬇️ PERMITIR preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Públicos
                        .requestMatchers("/sucursales", "/auth/login", "/auth/registro", "/auth/reset-emergency",
                                "/planes",
                                "/historial-precios/**",
                                "/usuarios-acciones/**", "/acciones", "/config/**", "/health", "/system/**",
                                "/config/database/test", "/ws-chat/**")
                        .permitAll()
                        // Permitir GET públicos para endpoints de LOVs (roles, etc.) sin abrir otros
                        // métodos
                        .requestMatchers(HttpMethod.GET, "/roles", "/roles/**").permitAll()
                        // El resto autenticado
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, e) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"mensaje\":\"No autenticado. Proporcione token válido.\"}");
                }));

        // ⬇️ Tu filtro JWT antes del UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ⬇️ CONFIG GLOBAL DE CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // IMPORTANTE: si usas Authorization o cookies, NO uses "*"
        cfg.setAllowedOrigins(
                List.of("http://10.225.16.51:5173", "http://10.225.16.248:5173", "http://localhost:5173",
                        "https://stockapp.agaviocarlos.com", "https://stockapp.agaviocarlos.com:5173",
                        "https://stocker.agaviocarlos.com", "https://stocker.agaviocarlos.com:5173",
                        "https://stock.agaviocarlos.com"));
        // Si necesitas patrones usa:
        // cfg.setAllowedOriginPatterns(List.of("http://localhost:*"));

        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "X-Config-Password"));
        cfg.setExposedHeaders(List.of("Location", "Content-Disposition"));
        cfg.setAllowCredentials(true); // si envías Authorization/cookies
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
