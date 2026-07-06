package com.stockbean.stockapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stockbean.stockapp.dto.ProductoProveedorDTO;
import com.stockbean.stockapp.service.ProductoProveedorService;

@RestController
@RequestMapping("/proveedores/{idProveedor}/productos")
public class ProductoProveedorController {

    private final ProductoProveedorService productoProveedorService;

    public ProductoProveedorController(ProductoProveedorService productoProveedorService) {
        this.productoProveedorService = productoProveedorService;
    }

    /**
     * GET /proveedores/{idProveedor}/productos
     * Lista todos los productos asignados al proveedor.
     */
    @GetMapping
    public List<ProductoProveedorDTO> listar(@PathVariable Integer idProveedor) {
        return productoProveedorService.listarPorProveedor(idProveedor);
    }

    /**
     * GET /proveedores/{idProveedor}/productos/activos
     * Lista solo los productos ACTIVOS asignados al proveedor.
     */
    @GetMapping("/activos")
    public List<ProductoProveedorDTO> listarActivos(@PathVariable Integer idProveedor) {
        return productoProveedorService.listarActivosPorProveedor(idProveedor);
    }

    /**
     * POST /proveedores/{idProveedor}/productos
     * Asigna un nuevo producto al proveedor.
     */
    @PostMapping
    public ResponseEntity<ProductoProveedorDTO> asignar(
            @PathVariable Integer idProveedor,
            @RequestBody ProductoProveedorDTO request) {
        return ResponseEntity.ok(productoProveedorService.asignar(idProveedor, request));
    }

    /**
     * PUT /proveedores/{idProveedor}/productos/{id}
     * Actualiza una asignación existente (precio, código, tiempo de entrega).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductoProveedorDTO> actualizar(
            @PathVariable Integer idProveedor,
            @PathVariable Integer id,
            @RequestBody ProductoProveedorDTO request) {
        return ResponseEntity.ok(productoProveedorService.actualizar(id, request));
    }

    /**
     * DELETE /proveedores/{idProveedor}/productos/{id}
     * Desactiva (soft delete) una asignación.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desasignar(
            @PathVariable Integer idProveedor,
            @PathVariable Integer id) {
        productoProveedorService.desasignar(id);
        return ResponseEntity.noContent().build();
    }
}
