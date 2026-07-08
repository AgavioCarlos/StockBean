package com.stockbean.stockapp.service;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockbean.stockapp.dto.GuardarAccionRequest;
import com.stockbean.stockapp.dto.UsuarioAccionDTO;
import com.stockbean.stockapp.model.admin.Empresa;
import com.stockbean.stockapp.model.admin.Pantallas;
import com.stockbean.stockapp.model.admin.AdminUsuarioPantalla;
import com.stockbean.stockapp.model.tablas.Usuario;
import com.stockbean.stockapp.repository.UsuarioPantallaRepository;
import com.stockbean.stockapp.repository.UsuarioRepository;

@Service
public class UsuarioAccionService {

        private static final Logger log = LoggerFactory.getLogger(UsuarioAccionService.class);

        @Autowired
        private UsuarioPantallaRepository adminUsuarioPantallaRepository;

        @Autowired
        private PantallaService pantallaService;

        @Autowired
        private UsuarioRepository usuarioRepository;

        public List<UsuarioAccionDTO> obtenerMatrizPermisos(Integer idUsuario, Integer idSucursal) {
                Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);

                List<Pantallas> pantallasDisponibles = pantallaService.findPantallasByRol(usuario.getId_rol());
                pantallasDisponibles
                                .forEach(p -> log.info("       -> Pantalla: id={}, nombre='{}', status={}, esRoot={}",
                                                p.getIdPantalla(), p.getNombre(), p.getStatus(), p.getEsRoot()));

                List<AdminUsuarioPantalla> permisosActuales = adminUsuarioPantallaRepository
                                .findByUsuarioIdAndEmpresaId(idUsuario, idSucursal);
                // permisosActuales.forEach(
                //                 p -> log.info("       -> Permiso: id={}, pantalla={}, ver={}, guardar={}, actualizar={}, eliminar={}",
                //                                 p.getIdUsuarioPantalla(),
                //                                 p.getPantalla() != null ? p.getPantalla().getNombre() : "NULL",
                //                                 p.getVer(), p.getGuardar(), p.getActualizar(), p.getEliminar()));

                List<UsuarioAccionDTO> matriz = new ArrayList<>();

                for (Pantallas pantalla : pantallasDisponibles) {
                        if (!Boolean.TRUE.equals(pantalla.getStatus())) {
                                continue;
                        }

                        UsuarioAccionDTO fila = new UsuarioAccionDTO();
                        fila.setIdPantalla(pantalla.getIdPantalla());
                        fila.setPantallaNombre(pantalla.getNombre());
                        fila.setPantallaClave(pantalla.getClave());

                        List<UsuarioAccionDTO.AccionItemDTO> accionesDTO = new ArrayList<>();

                        AdminUsuarioPantalla pActual = permisosActuales.stream()
                                        .filter(p -> p.getPantalla() != null
                                                        && p.getPantalla().getIdPantalla()
                                                                        .equals(pantalla.getIdPantalla()))
                                        .findFirst().orElse(null);

                        if (pActual == null) {
                                log.debug("  [INFO] Pantalla '{}' no tiene fila en admin_usuario_pantalla -> todos false",
                                                pantalla.getNombre());
                        }
                        accionesDTO.add(new UsuarioAccionDTO.AccionItemDTO(1, "view",
                                        pActual != null && Boolean.TRUE.equals(pActual.getVer())));
                        accionesDTO.add(new UsuarioAccionDTO.AccionItemDTO(2, "create",
                                        pActual != null && Boolean.TRUE.equals(pActual.getGuardar())));
                        accionesDTO.add(new UsuarioAccionDTO.AccionItemDTO(3, "update",
                                        pActual != null && Boolean.TRUE.equals(pActual.getActualizar())));
                        accionesDTO.add(new UsuarioAccionDTO.AccionItemDTO(4, "delete",
                                        pActual != null && Boolean.TRUE.equals(pActual.getEliminar())));

                        fila.setAcciones(accionesDTO);
                        matriz.add(fila);
                }
                return matriz;
        }

        @Transactional
        public void guardarPermisos(Integer idUsuario, Integer idSucursal, List<GuardarAccionRequest> permisos) {
                List<AdminUsuarioPantalla> actuales = adminUsuarioPantallaRepository.findByUsuarioIdAndEmpresaId(
                                idUsuario, idSucursal);

                for (GuardarAccionRequest req : permisos) {
                        AdminUsuarioPantalla existente = actuales.stream()
                                        .filter(p -> p.getPantalla() != null
                                                        && p.getPantalla().getIdPantalla().equals(req.getIdPantalla()))
                                        .findFirst().orElse(null);

                        if (existente == null) {
                                existente = new AdminUsuarioPantalla();
                                Usuario usuario = new Usuario();
                                usuario.setId_usuario(idUsuario);
                                existente.setUsuario(usuario);

                                Empresa empresa = new Empresa();
                                empresa.setIdEmpresa(idSucursal);

                                Pantallas pantalla = new Pantallas();
                                pantalla.setIdPantalla(req.getIdPantalla());
                                existente.setPantalla(pantalla);

                                existente.setVer(false);
                                existente.setGuardar(false);
                                existente.setActualizar(false);
                                existente.setEliminar(false);
                                actuales.add(existente);

                        }

                        boolean permitido = Boolean.TRUE.equals(req.getPermitido());
                        switch (req.getIdAccion()) {
                                case 1:
                                        existente.setVer(permitido);
                                        break;
                                case 2:
                                        existente.setGuardar(permitido);
                                        break;
                                case 3:
                                        existente.setActualizar(permitido);
                                        break;
                                case 4:
                                        existente.setEliminar(permitido);
                                        break;
                        }

                        adminUsuarioPantallaRepository.save(existente);
                }
        }
}