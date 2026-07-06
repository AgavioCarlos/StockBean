package com.stockbean.stockapp.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.model.tablas.Sucursal;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import com.stockbean.stockapp.service.SucursalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/sucursales")
// @PreAuthorize("hasAnyRole('SISTEM', 'ADMIN', 'GERENTE')")
public class SucursalController {

    @Autowired
    private SucursalService sucursalService;

    @GetMapping
    public List<Sucursal> listar() {
        return sucursalService.listarSucursales();
    }

    @GetMapping("/user")
    public ResponseEntity<List<Sucursal>> listarSucursales() {
        return ResponseEntity.ok(sucursalService.listarSucursales());
    }

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Sucursal>> listarPorEmpresa(@PathVariable Integer idEmpresa) {
        return ResponseEntity.ok(sucursalService.listarPorEmpresa(idEmpresa));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> obtener(@PathVariable Integer id) {
        Sucursal sucursal = sucursalService.obtenerPorId(id);
        return sucursal != null ? ResponseEntity.ok(sucursal) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Sucursal> guardar(@RequestBody Sucursal sucursal,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        Sucursal nuevaSucursal = sucursalService.guardar(sucursal, principal.getId());
        return ResponseEntity.ok(nuevaSucursal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> actualizar(@PathVariable Integer id, @RequestBody Sucursal sucursal) {
        Sucursal actualizada = sucursalService.actualizar(id, sucursal);
        return actualizada != null ? ResponseEntity.ok(actualizada) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        sucursalService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
