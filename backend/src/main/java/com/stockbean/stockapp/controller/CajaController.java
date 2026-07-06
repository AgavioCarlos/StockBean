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
import org.springframework.web.bind.annotation.RestController;

import com.stockbean.stockapp.dto.AperturaCajaRequest;
import com.stockbean.stockapp.dto.CierreCajaRequest;
import com.stockbean.stockapp.dto.MovimientoCajaRequest;
import com.stockbean.stockapp.model.tablas.Caja;
import com.stockbean.stockapp.model.tablas.MovimientoCaja;
import com.stockbean.stockapp.model.tablas.TurnoCaja;
import com.stockbean.stockapp.security.UsuarioPrincipal;
import com.stockbean.stockapp.service.CajaService;

@RestController
@RequestMapping("/cajas")
@CrossOrigin("*")
@PreAuthorize("hasAnyRole('SISTEM', 'ADMIN', 'GERENTE', 'CAJERO')")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @GetMapping("/sucursal")
    public ResponseEntity<?> obtenerCajas() {
        try {
            List<Caja> cajas = cajaService.obtenerCajasPorSucursal();
            return ResponseEntity.ok(cajas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/turnos/activo")
    public ResponseEntity<?> obtenerTurnoActivo(@AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            TurnoCaja turno = cajaService.obtenerTurnoActivo(principal.getId());
            return ResponseEntity.ok(turno); // null si no tiene turno
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/turnos/abrir")
    public ResponseEntity<?> abrirCaja(
            @RequestBody AperturaCajaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            TurnoCaja turno = cajaService.abrirCaja(request, principal.getId());
            return ResponseEntity.ok(turno);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/turnos/cerrar")
    public ResponseEntity<?> cerrarCaja(
            @RequestBody CierreCajaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            TurnoCaja turno = cajaService.cerrarCaja(request, principal.getId());
            return ResponseEntity.ok(turno);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/turnos/movimiento")
    public ResponseEntity<?> registrarMovimiento(
            @RequestBody MovimientoCajaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        try {
            MovimientoCaja mov = cajaService.registrarMovimiento(request, principal.getId());
            return ResponseEntity.ok(mov);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
