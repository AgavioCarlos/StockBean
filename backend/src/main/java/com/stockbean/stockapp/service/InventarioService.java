package com.stockbean.stockapp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.stockbean.stockapp.model.tablas.Inventario;
import com.stockbean.stockapp.model.tablas.Usuario;
import com.stockbean.stockapp.model.tablas.HistorialPrecios;
import com.stockbean.stockapp.repository.HistorialPreciosRepository;
import com.stockbean.stockapp.repository.InventarioRepository;
import com.stockbean.stockapp.repository.UsuarioRepository;
import com.stockbean.stockapp.security.AuthHelper;
import com.stockbean.stockapp.repository.ProductoRepository;
import com.stockbean.stockapp.repository.SucursalRepository;
import com.stockbean.stockapp.model.tablas.Sucursal;
import com.stockbean.stockapp.model.tablas.Producto;
import org.springframework.transaction.annotation.Transactional;

import lombok.NonNull;

@Service
public class InventarioService {

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistorialPreciosRepository historialPreciosRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private SucursalAccessService sucursalAccessService;

    @Autowired
    private com.stockbean.stockapp.repository.UsuarioSucursalRepository usuarioSucursalRepository;

    public List<Inventario> listarPorUsuarioYSucursal(Integer idUsuario, Integer idSucursal) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        validarAccesoSucursal(usuario, idSucursal);

        List<Inventario> inventarios = inventarioRepository.findBySucursalIdAndStatusTrue(idSucursal);

        List<HistorialPrecios> prices = historialPreciosRepository.findCurrentPricesByBranch(idSucursal);
        Map<Integer, HistorialPrecios> priceMap = prices.stream()
                .collect(Collectors.toMap(hp -> hp.getProducto().getId_producto(), hp -> hp,
                        (existente, nuevo) -> nuevo));

        inventarios.forEach(inv -> {
            HistorialPrecios hp = priceMap.get(inv.getProducto().getId_producto());
            if (hp != null) {
                inv.setPrecioNuevo(hp.getPrecioNuevo());
                inv.setPrecioAnterior(hp.getPrecioAnterior());
                inv.setIdTipoPrecio(hp.getIdTipoPrecio());
                inv.setMotivo(hp.getMotivo());
            }
        });

        return inventarios;
    }

    public List<Inventario> listarPorUsuarioYMultipleSucursales(Integer idUsuario, List<Integer> idsSucursales) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        final List<Integer> finalIds;
        if (!"SISTEM".equalsIgnoreCase(usuario.getNombre_rol()) && !"ADMIN".equalsIgnoreCase(usuario.getNombre_rol())) {
            List<com.stockbean.stockapp.dto.UsuarioSucursalResponse> userSucursales = usuarioSucursalRepository.findByUsuarioIdUsuario(idUsuario);
            List<Integer> allowedIds = userSucursales.stream()
                    .filter(us -> Boolean.TRUE.equals(us.getStatus()))
                    .map(com.stockbean.stockapp.dto.UsuarioSucursalResponse::getIdSucursal)
                    .collect(Collectors.toList());

            finalIds = idsSucursales.stream()
                    .filter(allowedIds::contains)
                    .collect(Collectors.toList());
        } else {
            finalIds = idsSucursales;
        }

        if (finalIds.isEmpty()) {
            return List.of();
        }

        List<Inventario> inventarios = inventarioRepository.findBySucursalIdsAndStatusTrue(finalIds);

        List<HistorialPrecios> prices = historialPreciosRepository.findAll().stream()
                .filter(hp -> hp.getProducto() != null && hp.getSucursal() != null && finalIds.contains(hp.getSucursal().getIdSucursal()))
                .collect(Collectors.toList());

        Map<String, HistorialPrecios> priceMap = prices.stream()
                .collect(Collectors.toMap(
                        hp -> hp.getProducto().getId_producto() + "-" + hp.getSucursal().getIdSucursal(),
                        hp -> hp,
                        (existente, nuevo) -> nuevo));

        inventarios.forEach(inv -> {
            HistorialPrecios hp = priceMap.get(inv.getProducto().getId_producto() + "-" + inv.getSucursal().getIdSucursal());
            if (hp != null) {
                inv.setPrecioNuevo(hp.getPrecioNuevo());
                inv.setPrecioAnterior(hp.getPrecioAnterior());
                inv.setIdTipoPrecio(hp.getIdTipoPrecio());
                inv.setMotivo(hp.getMotivo());
            }
        });

        return inventarios;
    }

    @Transactional
    public Inventario guardar(Inventario inventario, @NonNull Integer idUsuario) {
        Integer idSucursal = (inventario.getSucursal() != null) ? inventario.getSucursal().getIdSucursal() : null;
        final Integer idSucursalFinal = (idSucursal != null) ? idSucursal : AuthHelper.getCurrentSucursalId();

        if (idSucursalFinal == null) {
            throw new RuntimeException("Sucursal es requerida para registrar inventario.");
        }
        Sucursal sucursal = sucursalRepository.findById(idSucursal)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: " + idSucursal));

        if (inventario.getProducto() == null || inventario.getProducto().getId_producto() == null) {
            throw new RuntimeException("El producto es requerido para registrar inventario.");
        }
        Integer idProducto = inventario.getProducto().getId_producto();
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + idProducto));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        validarAccesoSucursal(usuario, idSucursal);

        // Asignar entidades gestionadas
        inventario.setSucursal(sucursal);
        inventario.setProducto(producto);

        if (inventario.getStatus() == null)
            inventario.setStatus(true);
        if (inventario.getFechaAlta() == null)
            inventario.setFechaAlta(LocalDateTime.now());
        inventario.setFechaUltimaModificacion(LocalDateTime.now());

        Inventario savedInventario = inventarioRepository.save(inventario);

        if (inventario.getPrecioNuevo() != null) {
            HistorialPrecios historial = new HistorialPrecios();
            historial.setProducto(producto);
            historial.setSucursal(sucursal);
            // historial.setPrecioAnterior(inventario.getPrecioAnterior());
            historial.setPrecioNuevo(inventario.getPrecioNuevo());
            historial.setIdTipoPrecio(inventario.getIdTipoPrecio() != null ? inventario.getIdTipoPrecio() : 1);
            historial.setMotivo(
                    inventario.getMotivo() != null && !inventario.getMotivo().isEmpty() ? inventario.getMotivo()
                            : "Asignación inicial en inventario");
            historial.setUsuario(usuario);
            historial.setFechaCambio(LocalDateTime.now());
            historial.setFechaAlta(LocalDateTime.now());
            historialPreciosRepository.save(historial);
        }

        return savedInventario;
    }

    @Transactional
    public Inventario actualizar(@NonNull Integer id, Inventario inventarioDetails, @NonNull Integer idUsuario) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado con ID: " + id));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        // Validate access to the EXISTING inventory item's branch
        validarAccesoSucursal(usuario, inventario.getSucursal().getIdSucursal());

        // Update fields
        if (inventarioDetails.getStock_actual() != null)
            inventario.setStock_actual(inventarioDetails.getStock_actual());
        if (inventarioDetails.getStock_minimo() != null)
            inventario.setStock_minimo(inventarioDetails.getStock_minimo());
        if (inventarioDetails.getFecha_caducidad() != null)
            inventario.setFecha_caducidad(inventarioDetails.getFecha_caducidad());
        if (inventarioDetails.getLoteInventario() != null)
            inventario.setLoteInventario(inventarioDetails.getLoteInventario());

        inventario.setFechaUltimaModificacion(LocalDateTime.now());

        Inventario updatedInventario = inventarioRepository.save(inventario);

        if (inventarioDetails.getPrecioNuevo() != null) {
            HistorialPrecios historial = new HistorialPrecios();
            historial.setProducto(updatedInventario.getProducto());
            historial.setSucursal(updatedInventario.getSucursal());
            historial.setPrecioAnterior(inventarioDetails.getPrecioAnterior());
            historial.setPrecioNuevo(inventarioDetails.getPrecioNuevo());
            historial.setIdTipoPrecio(
                    inventarioDetails.getIdTipoPrecio() != null ? inventarioDetails.getIdTipoPrecio() : 1);
            historial.setMotivo(inventarioDetails.getMotivo() != null && !inventarioDetails.getMotivo().isEmpty()
                    ? inventarioDetails.getMotivo()
                    : "Actualización de precio");
            historial.setUsuario(usuario);
            historial.setFechaCambio(LocalDateTime.now());
            historial.setFechaAlta(LocalDateTime.now());
            historialPreciosRepository.save(historial);
        }

        return updatedInventario;
    }

    public void eliminar(@NonNull Integer id, @NonNull Integer idUsuario) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado con ID: " + id));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        validarAccesoSucursal(usuario, inventario.getSucursal().getIdSucursal());

        inventario.setStatus(false);
        inventario.setFechaBaja(LocalDateTime.now());
        inventarioRepository.save(inventario);
    }

    public List<Inventario> listarTodos() {
        return inventarioRepository.findAll();
    }

    private void validarAccesoSucursal(Usuario usuario, @NonNull Integer idSucursal) {
        sucursalAccessService.validarAcceso(usuario, idSucursal);
    }
}
