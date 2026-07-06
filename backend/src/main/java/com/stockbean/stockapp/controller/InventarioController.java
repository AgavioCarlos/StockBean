package com.stockbean.stockapp.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.model.tablas.Inventario;
import com.stockbean.stockapp.service.InventarioService;
import org.springframework.security.access.prepost.PreAuthorize;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
@RestController
@RequestMapping("/inventario")
@CrossOrigin("*")
@PreAuthorize("hasAnyRole('SISTEM', 'ADMIN', 'GERENTE', 'CAJERO')")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<?> listar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @RequestParam(required = false) Integer idSucursal) {

        try {
            Integer sucursalFinal = idSucursal != null ? idSucursal : principal.getIdSucursal();

            if (sucursalFinal == null) {
                return ResponseEntity.badRequest().body("No se ha especificado una sucursal.");
            }

            List<Inventario> inventario = inventarioService.listarPorUsuarioYSucursal(principal.getId(), sucursalFinal);
            return ResponseEntity.ok(inventario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(
            @RequestBody Inventario inventario,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            return ResponseEntity.ok(inventarioService.guardar(inventario, principal.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> actualizar(
            @RequestBody Inventario inventario,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        try {
            if (inventario.getId_inventario() == null) {
                return ResponseEntity.badRequest().body("ID de inventario es requerido para actualizar");
            }
            return ResponseEntity
                    .ok(inventarioService.actualizar(inventario.getId_inventario(), inventario, principal.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPorId(
            @PathVariable Integer id,
            @RequestBody Inventario inventario,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            return ResponseEntity.ok(inventarioService.actualizar(id, inventario, principal.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            inventarioService.eliminar(id, principal.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
