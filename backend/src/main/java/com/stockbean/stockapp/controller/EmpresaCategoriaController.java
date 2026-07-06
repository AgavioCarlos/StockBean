package com.stockbean.stockapp.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.stockbean.stockapp.model.catalogos.Categoria;
import com.stockbean.stockapp.service.EmpresaCategoriaService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/empres-categorias")
public class EmpresaCategoriaController {

    @Autowired
    private EmpresaCategoriaService empresaCategoriaService;

    @GetMapping("/asignacion")
    public ResponseEntity<List<Categoria>> getAsignadas(@RequestParam @NonNull Integer idEmpresa) {
        return ResponseEntity.ok(empresaCategoriaService.getCategoriasAsignadas(idEmpresa));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Categoria>> getDisponibles(@RequestParam @NonNull Integer idEmpresa) {
        return ResponseEntity.ok(empresaCategoriaService.getCategoriasDisponibles(idEmpresa));
    }

    @PostMapping("/asignar")
    public ResponseEntity<Categoria> asignarCategoria(@RequestBody Map<String, Integer> payload) {
        Integer idEmpresa = payload.get("idEmpresa");
        Integer idCategoria = payload.get("idCategoria");
        if (idEmpresa == null || idCategoria == null) {
            return ResponseEntity.badRequest().build();
        }
        Categoria c = empresaCategoriaService.asignarCategoria(idEmpresa, idCategoria);
        return ResponseEntity.ok(c);
    }

    @PostMapping("/desasignar")
    public ResponseEntity<Void> desasignarCategoria(@RequestBody Map<String, Integer> payload) {
        Integer idEmpresa = payload.get("idEmpresa");
        Integer idCategoria = payload.get("idCategoria");
        if (idEmpresa != null && idCategoria != null) {
            empresaCategoriaService.desasignarCategoria(idEmpresa, idCategoria);
        }
        return ResponseEntity.ok().build();
    }
}
