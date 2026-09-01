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

    @Autowired
    private com.stockbean.stockapp.repository.UsuarioSucursalRepository usuarioSucursalRepository;

    @GetMapping
    public ResponseEntity<?> listar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @RequestParam(required = false) Integer idSucursal) {

        try {
            Integer sucursalFinal = idSucursal != null ? idSucursal : principal.getIdSucursal();

            if (sucursalFinal == null) {
                List<com.stockbean.stockapp.dto.UsuarioSucursalResponse> userSucursales = usuarioSucursalRepository.findByUsuarioIdUsuario(principal.getId());
                java.util.List<Integer> allowedIds = userSucursales.stream()
                        .filter(us -> Boolean.TRUE.equals(us.getStatus()))
                        .map(com.stockbean.stockapp.dto.UsuarioSucursalResponse::getIdSucursal)
                        .collect(java.util.stream.Collectors.toList());

                if (allowedIds.isEmpty()) {
                    return ResponseEntity.ok(new java.util.ArrayList<>());
                }

                List<Inventario> inventario = inventarioService.listarPorUsuarioYMultipleSucursales(principal.getId(), allowedIds);
                return ResponseEntity.ok(inventario);
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
