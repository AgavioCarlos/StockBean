package com.stockbean.stockapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.dto.PantallaDTO;
import com.stockbean.stockapp.model.admin.Pantallas;
import com.stockbean.stockapp.security.AuthHelper;
import com.stockbean.stockapp.service.PantallaService;

@RestController
@RequestMapping("/pantallas")
public class PantallaController {

    @Autowired
    private PantallaService pantallaService;

    @Autowired
    private AuthHelper authHelper;

    @GetMapping
    public ResponseEntity<?> getPantallasUsuario(@PathVariable Integer idSucursal) {
        Integer idUsuario = authHelper.getIdUsuarioFromToken();
        if (idUsuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No se pudo obtener el usuario autenticado");
        }
        List<PantallaDTO> pantallas = pantallaService.findPantallasUsuario(idUsuario, idSucursal);
        return ResponseEntity.ok(pantallas);
    }

    @GetMapping("/todas")
    public ResponseEntity<?> getTodasPantallas() {
        List<Pantallas> pantallas = pantallaService.findAllActivas();
        return ResponseEntity.ok(pantallas);
    }

    @GetMapping("/por-rol")
    public ResponseEntity<?> getPantallasFiltradas() {
        Integer idRol = authHelper.getIdRolFromToken();

        if (idRol == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No se pudo obtener el rol del usuario autenticado");
        }

        List<Pantallas> pantallas = pantallaService.findPantallasByRol(idRol);
        return ResponseEntity.ok(pantallas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPantalla(@PathVariable Integer id) {
        return ResponseEntity.ok(pantallaService.getPantalla(id));
    }

    @PostMapping
    public ResponseEntity<?> createPantalla(@RequestBody Pantallas p) {
        return ResponseEntity.ok(pantallaService.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePantalla(@PathVariable Integer id, @RequestBody Pantallas p) {
        p.setIdPantalla(id);
        return ResponseEntity.ok(pantallaService.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePantalla(@PathVariable Integer id) {
        pantallaService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/padres")
    public ResponseEntity<?> getPadres() {
        return ResponseEntity.ok(pantallaService.findPadres());
    }
}
