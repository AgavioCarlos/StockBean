package com.stockbean.stockapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
@Component
public class AuthHelper {

    @Autowired
    private JwtUtil jwtUtil;

    private String getJwtFromRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }

    public Integer getIdRolFromToken() {
        String token = getJwtFromRequest();
        if (token != null) {
            return jwtUtil.extractIdRol(token);
        }
        return null;
    }

    public String getUsernameFromToken() {
        String token = getJwtFromRequest();
        if (token != null) {
            return jwtUtil.extractUsername(token);
        }
        return null;
    }

    public Integer getIdUsuarioFromToken() {
        String token = getJwtFromRequest();
        if (token != null) {
            return jwtUtil.extractIdUsuario(token);
        }
        return null;
    }

    public Integer getIdSucursalFromToken() {
        String token = getJwtFromRequest();
        if (token != null) {
            return jwtUtil.extractIdSucursal(token);
        }
        return null;
    }

    public static Integer getCurrentSucursalId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal) {
            return ((UsuarioPrincipal) auth.getPrincipal()).getIdSucursal();
        }
        return null;
    }
}
