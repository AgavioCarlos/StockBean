package com.stockbean.stockapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stockbean.stockapp.dto.ProductoBusquedaDTO;
import com.stockbean.stockapp.dto.VentaRequest;
import com.stockbean.stockapp.model.catalogos.MetodoPago;
import com.stockbean.stockapp.model.tablas.DetalleVenta;
import com.stockbean.stockapp.model.tablas.Venta;
import com.stockbean.stockapp.security.AuthHelper;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import com.stockbean.stockapp.service.VentaService;

@RestController
@RequestMapping("/ventas")
@CrossOrigin("*")
@PreAuthorize("hasAnyRole('SISTEM', 'ADMIN', 'GERENTE', 'CAJERO')")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping("/buscar-producto")
    public ResponseEntity<?> buscarProducto(
            @RequestParam(required = false) String codigoBarras,
            @RequestParam(required = false) String nombre,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            Integer idSucursal = AuthHelper.getCurrentSucursalId();
            List<ProductoBusquedaDTO> productos = ventaService.buscarProductos(
                    idSucursal, codigoBarras, nombre, principal.getId());
            return ResponseEntity.ok(productos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarVenta(
            @RequestBody VentaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            Venta venta = ventaService.registrarVenta(request, principal.getId());
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Listar ventas de una sucursal
    // GET /ventas?idSucursal=1
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> listarVentas(
            @RequestParam Integer idSucursal,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            List<Venta> ventas = ventaService.listarVentasPorSucursal(idSucursal, principal.getId());
            return ResponseEntity.ok(ventas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Obtener detalle de una venta
    // GET /ventas/{idVenta}/detalle
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{idVenta}/detalle")
    public ResponseEntity<?> obtenerDetalle(@PathVariable Integer idVenta) {
        try {
            List<DetalleVenta> detalle = ventaService.obtenerDetalleVenta(idVenta);
            return ResponseEntity.ok(detalle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Obtener métodos de pago disponibles
    // GET /ventas/metodos-pago
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/metodos-pago")
    public ResponseEntity<?> listarMetodosPago() {
        try {
            List<MetodoPago> metodos = ventaService.listarMetodosPago();
            return ResponseEntity.ok(metodos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
