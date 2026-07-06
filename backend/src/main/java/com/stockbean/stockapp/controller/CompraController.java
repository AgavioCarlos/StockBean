package com.stockbean.stockapp.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.dto.CompraDTO;
import com.stockbean.stockapp.dto.CompraRequest;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import com.stockbean.stockapp.service.CompraService;

@RestController
@RequestMapping("/compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping
    public List<CompraDTO> listar(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return compraService.listar(principal.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraDTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }

    @PostMapping()
    public ResponseEntity<CompraDTO> guardar(
            @RequestBody CompraRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(compraService.guardar(request, principal.getId()));
    }

    /**
     * Actualiza una compra existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompraDTO> actualizar(@PathVariable Integer id, @RequestBody CompraRequest request) {
        return ResponseEntity.ok(compraService.actualizar(id, request));
    }

}
