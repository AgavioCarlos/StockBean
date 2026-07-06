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

import com.stockbean.stockapp.dto.UsuarioSucursalResponse;
import com.stockbean.stockapp.model.tablas.UsuarioSucursal;
import com.stockbean.stockapp.service.UsuarioSucursalService;
import lombok.NonNull;

@RestController
@RequestMapping("/usuario-sucursales")
public class UsuarioSucursalController {

    @Autowired
    private UsuarioSucursalService usuarioSucursalService;

    @GetMapping
    public List<UsuarioSucursal> listarUsuarioSucursal() {
        return usuarioSucursalService.listarTodos();
    }

    @GetMapping("/{idUsuario}")
    public List<UsuarioSucursalResponse> obtenerPorIdUsuario(@PathVariable @NonNull Integer idUsuario) {
        return usuarioSucursalService.obtenerPorIdUsuario(idUsuario);
    }

    @PostMapping
    public ResponseEntity<UsuarioSucursal> asignarUsuarioSucursal(@RequestBody @NonNull UsuarioSucursal usuarioSucursal) {
        UsuarioSucursal nuevo = usuarioSucursalService.guardar(usuarioSucursal);
        return ResponseEntity.ok(nuevo);
    }

    @PutMapping
    public ResponseEntity<UsuarioSucursal> actualizarUsuarioSucursal(
            @RequestBody @NonNull UsuarioSucursal usuarioSucursal) {
        if (usuarioSucursal.getIdUsuarioSucursal() == null) {
            return ResponseEntity.badRequest().build();
        }
        UsuarioSucursal actualizado = usuarioSucursalService.actualizar(usuarioSucursal);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuarioSucursal(@PathVariable @NonNull Integer id) {
        usuarioSucursalService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
