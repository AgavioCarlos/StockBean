package com.stockbean.stockapp.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Lee la clave secreta desde application.properties para mayor seguridad.
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extracExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Integer extractIdRol(String token) {
        return extractClaim(token, claims -> claims.get("id_rol", Integer.class));
    }

    public Integer extractIdUsuario(String token) {
        return extractClaim(token, claims -> claims.get("id_usuario", Integer.class));
    }

    public String extractNombreRol(String token) {
        return extractClaim(token, claims -> claims.get("nombre_rol", String.class));
    }

    public Integer extractIdSucursal(String token) {
        return extractClaim(token, claims -> claims.get("id_sucursal", Integer.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = this.SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Boolean isTokenExpired(String token) {
        return extracExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Extraer rol de las authorities si es necesario, o pasar null
        return createToken(claims, userDetails.getUsername());
    }

    public String generateToken(UserDetails userDetails, Integer idUsuario, Integer idRol, String nombreRol, Integer Sucursal) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id_usuario", idUsuario);
        claims.put("id_rol", idRol);
        claims.put("nombre_rol", nombreRol);
        claims.put("id_sucursal", Sucursal);
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 10)) // 10 min
                .signWith(getSigningKey()) // El algoritmo se infiere de la clave
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
