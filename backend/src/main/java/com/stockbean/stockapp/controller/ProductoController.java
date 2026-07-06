package com.stockbean.stockapp.controller;
import java.util.List;
import com.stockbean.stockapp.dto.ProductoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.stockbean.stockapp.dto.ProductoRequest;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import com.stockbean.stockapp.service.ProductoService;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PreAuthorize("hasAnyRole('SISTEM', 'ADMIN')")
    @GetMapping
    public List<ProductoDTO> listar(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return productoService.listar(principal.getId());
    }

    @PreAuthorize("hasAnyRole('SISTEM', 'ADMIN')")
    @GetMapping("/page")
    public Page<ProductoDTO> listarPaginado(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        return productoService.listarPaginado(principal.getId(), pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Integer id) {
        ProductoDTO producto = productoService.obtenerPorId(id);
        return producto != null ? ResponseEntity.ok(producto) : ResponseEntity.notFound().build();
    }

    @PostMapping()
    public ResponseEntity<ProductoDTO> guardar(@RequestBody ProductoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        ProductoDTO resultado = productoService.guardar(dto, principal.getId());
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Integer id, @RequestBody ProductoRequest dto) {
        ProductoDTO producto = productoService.actualizar(id, dto);
        return producto != null ? ResponseEntity.ok(producto) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
