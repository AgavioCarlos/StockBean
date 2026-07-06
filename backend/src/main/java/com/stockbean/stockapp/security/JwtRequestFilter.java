package com.stockbean.stockapp.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        // ⚠️ Ignorar preflight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 1️⃣ Intentar leer token (SIN cortar flujo)
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Token recibido para usuario: {}", username);
            } catch (JwtException ex) {
                logger.warn("JWT inválido: {}", ex.getMessage());
                chain.doFilter(request, response);
                return;
            } catch (Exception ex) {
                logger.error("Error procesando JWT", ex);
                chain.doFilter(request, response);
                return;
            }
        } else {
            logger.debug("No se encontró Authorization header o no comienza con Bearer");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                logger.debug("Intentando cargar UserDetails para: {}", username);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // Si el UserDetails es nuestro UsuarioPrincipal, le inyectamos la sucursal del token
                    if (userDetails instanceof UsuarioPrincipal) {
                        Integer idSucursal = jwtUtil.extractIdSucursal(jwt);
                        ((UsuarioPrincipal) userDetails).setIdSucursal(idSucursal);
                        logger.debug("Sucursal {} asignada al principal para el usuario: {}", idSucursal, username);
                    }

                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    logger.info("✅ Autenticación exitosa en {} para: {} (Sucursal: {})",
                            (request.getRequestURI().contains("/auth/") ? "auth" : "app"), username,
                            (userDetails instanceof UsuarioPrincipal ? ((UsuarioPrincipal) userDetails).getIdSucursal()
                                    : "N/A"));
                } else {
                    logger.warn("❌ Token no válido (expirado o firma incorrecta) para: {}", username);
                }
            } catch (Exception ex) {
                logger.error("❌ Error validando usuario '{}' en la base de datos actual: {}", username, ex.getMessage());
                // El contexto seguirá siendo null, lo que provocará el 401 en SecurityConfig
            }
        }

        // 3️⃣ SIEMPRE continuar
        chain.doFilter(request, response);
    }
}
