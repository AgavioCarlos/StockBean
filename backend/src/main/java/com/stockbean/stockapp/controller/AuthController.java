package com.stockbean.stockapp.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.dto.LoginRequest;
import com.stockbean.stockapp.dto.RegistroRequest;
import com.stockbean.stockapp.service.AuthService;
import com.stockbean.stockapp.service.AuthService.LoginResult;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/registro")
    public ResponseEntity<Map<String, String>> registrar(@RequestBody RegistroRequest request) {
        authService.registrar(request);
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Registro exitoso");
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody LoginRequest request) {
        LoginResult result = authService.login(request.getSucursal(), request.getCuenta(), request.getPassword());
        return ResponseEntity.status(result.getHttpStatus()).body(result.getBody());
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("token");
        Integer sucursal = null;
        if (request.containsKey("sucursal") && request.get("sucursal") != null) {
            Object sVal = request.get("sucursal");
            if (sVal instanceof Number) {
                sucursal = ((Number) sVal).intValue();
            } else if (sVal instanceof String && !((String) sVal).isEmpty()) {
                try {
                    sucursal = Integer.parseInt((String) sVal);
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
        }
        LoginResult result = authService.refreshToken(token, sucursal);
        return ResponseEntity.status(result.getHttpStatus()).body(result.getBody());
    }

    @Autowired
    private com.stockbean.stockapp.service.UsuarioService usuarioService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/reset-emergency")
    public ResponseEntity<?> resetEmergency() {
        com.stockbean.stockapp.model.tablas.Usuario user = usuarioService.findByCuenta("sistemas");
        if (user == null) {
            Map<String, String> res = new HashMap<>();
            res.put("mensaje", "Usuario 'sistemas' no encontrado");
            return ResponseEntity.status(404).body(res);
        }
        user.setPassword(passwordEncoder.encode("123456"));
        usuarioService.save(user);
        Map<String, String> res = new HashMap<>();
        res.put("mensaje", "Contraseña restablecida exitosamente para sistemas a '123456'");
        return ResponseEntity.ok(res);
    }
}
