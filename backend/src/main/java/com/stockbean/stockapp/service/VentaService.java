package com.stockbean.stockapp.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockbean.stockapp.dto.DetalleVentaItem;
import com.stockbean.stockapp.dto.ProductoBusquedaDTO;
import com.stockbean.stockapp.dto.VentaRequest;
import com.stockbean.stockapp.model.catalogos.MetodoPago;
import com.stockbean.stockapp.model.tablas.DetalleVenta;
import com.stockbean.stockapp.model.tablas.HistorialPrecios;
import com.stockbean.stockapp.model.tablas.Inventario;
import com.stockbean.stockapp.model.tablas.Producto;
import com.stockbean.stockapp.model.tablas.Usuario;
import com.stockbean.stockapp.model.tablas.Venta;
import com.stockbean.stockapp.repository.DetalleVentaRepository;
import com.stockbean.stockapp.repository.HistorialPreciosRepository;
import com.stockbean.stockapp.repository.InventarioRepository;
import com.stockbean.stockapp.repository.MetodoPagoRepository;
import com.stockbean.stockapp.repository.ProductoRepository;
import com.stockbean.stockapp.repository.UsuarioRepository;
import com.stockbean.stockapp.repository.VentaRepository;
import com.stockbean.stockapp.security.AuthHelper;
import com.stockbean.stockapp.repository.TurnoCajaRepository;
import com.stockbean.stockapp.model.tablas.TurnoCaja;
import java.util.Objects;
import lombok.NonNull;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private TurnoCajaRepository turnoCajaRepository;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistorialPreciosRepository historialPreciosRepository;

    @Autowired
    private SucursalAccessService sucursalAccessService;

    @Autowired
    private com.stockbean.stockapp.repository.UsuarioSucursalRepository usuarioSucursalRepository;

    // ─────────────────────────────────────────────────────────────
    // BUSCAR PRODUCTOS PARA EL PUNTO DE VENTA
    // ─────────────────────────────────────────────────────────────

    /**
     * Busca productos por código de barras o por nombre en una sucursal.
     * Devuelve la info del producto, su precio de venta actual y stock disponible.
     */
    public List<ProductoBusquedaDTO> buscarProductos(
            @NonNull Integer idSucursal,
            String codigoBarras,
            String nombre,
            @NonNull Integer idUsuario) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        validarAccesoSucursal(usuario, idSucursal);

        List<Inventario> inventarios;

        if (codigoBarras != null && !codigoBarras.trim().isEmpty()) {
            // Búsqueda exacta por código de barras
            inventarios = inventarioRepository.findByCodigoBarrasAndSucursal(codigoBarras.trim(), idSucursal);
        } else if (nombre != null && !nombre.trim().isEmpty()) {
            // Búsqueda parcial por nombre
            inventarios = inventarioRepository.findByNombreProductoAndSucursal(nombre.trim(), idSucursal);
        } else {
            throw new RuntimeException("Debes proporcionar un código de barras o nombre para buscar.");
        }

        // Obtener precios actuales de la sucursal
        List<HistorialPrecios> precios = historialPreciosRepository.findCurrentPricesByBranch(idSucursal);
        Map<Integer, BigDecimal> precioMap = precios.stream()
                .collect(Collectors.toMap(
                        hp -> hp.getProducto().getId_producto(),
                        HistorialPrecios::getPrecioNuevo,
                        (existente, nuevo) -> nuevo));

        List<ProductoBusquedaDTO> resultados = new ArrayList<>();

        for (Inventario inv : inventarios) {
            Producto prod = inv.getProducto();
            ProductoBusquedaDTO dto = new ProductoBusquedaDTO();
            dto.setIdProducto(prod.getId_producto());
            dto.setNombre(prod.getNombre());
            dto.setDescripcion(prod.getDescripcion());
            dto.setCodigoBarras(prod.getCodigoBarras());
            dto.setImagenUrl(prod.getImagenUrl());
            dto.setStockDisponible(inv.getStock_actual());
            dto.setStockMinimo(inv.getStock_minimo());

            // Unidad, marca, categoría
            if (prod.getUnidad() != null)
                dto.setUnidad(prod.getUnidad().getNombre());
            if (prod.getMarca() != null)
                dto.setMarca(prod.getMarca().getNombre());
            if (prod.getCategoria() != null)
                dto.setCategoria(prod.getCategoria().getNombre());

            // Precio de venta actual
            BigDecimal precio = precioMap.get(prod.getId_producto());
            dto.setPrecioVenta(precio != null ? precio : BigDecimal.ZERO);

            resultados.add(dto);
        }

        return resultados;
    }

    @Transactional
    public Venta registrarVenta(@NonNull VentaRequest request, @NonNull Integer idUsuario) {

        Integer idSucursal = AuthHelper.getCurrentSucursalId();

        if (idSucursal == null) {
            throw new RuntimeException("La sucursal es requerida.");
        }

        if (request.getIdMetodoPago() == null) {
            throw new RuntimeException("El método de pago es requerido.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("La venta debe tener al menos un producto.");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        // Verificar Turno
        TurnoCaja turnoActivo = turnoCajaRepository.findByIdUsuarioAndEstado(idUsuario, "ABIERTO");
        if (turnoActivo == null) {
            throw new RuntimeException("No hay un turno de caja abierto para registrar la venta.");
        }

        validarAccesoSucursal(usuario, idSucursal);

        MetodoPago metodoPago = metodoPagoRepository.findById(Objects.requireNonNull(request.getIdMetodoPago()))
                .orElseThrow(() -> new RuntimeException(
                        "Método de pago no encontrado con ID: " + request.getIdMetodoPago()));

        // Validar stock ANTES de crear la venta
        for (DetalleVentaItem item : request.getItems()) {
            List<Inventario> invList = inventarioRepository.findByProductoAndSucursal(
                    item.getIdProducto(), idSucursal);

            if (invList.isEmpty()) {
                Producto prod = productoRepository.findById(Objects.requireNonNull(item.getIdProducto()))
                        .orElseThrow(
                                () -> new RuntimeException("Producto no encontrado con ID: " + item.getIdProducto()));
                throw new RuntimeException(
                        "No existe inventario para el producto \"" + prod.getNombre() + "\" en esta sucursal.");
            }

            Inventario inv = invList.get(0);
            if (inv.getStock_actual() < item.getCantidad()) {
                throw new RuntimeException(
                        "No hay suficiente existencia del producto \"" + inv.getProducto().getNombre()
                                + "\" (stock actual: " + inv.getStock_actual()
                                + ", solicitado: " + item.getCantidad() + "). Verifica inventario.");
            }
        }

        // Calcular total desde los items
        BigDecimal totalCalculado = BigDecimal.ZERO;
        for (DetalleVentaItem item : request.getItems()) {
            BigDecimal subtotal = item.getSubtotal();
            if (subtotal == null) {
                subtotal = item.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(item.getCantidad()));
                if (item.getDescuento() != null) {
                    subtotal = subtotal.subtract(item.getDescuento());
                }
            }
            totalCalculado = totalCalculado.add(subtotal);
        }

        // 1. Crear la venta (header)
        Venta venta = new Venta();
        venta.setIdSucursal(idSucursal);
        venta.setIdUsuario(idUsuario);
        venta.setFechaVenta(LocalDateTime.now());
        venta.setTotal(totalCalculado.intValue());
        venta.setMetodoPago(metodoPago);
        venta.setFechaAlta(LocalDateTime.now());
        venta.setIdTurno(turnoActivo.getIdTurno());
        venta.setEstado("COMPLETADA");

        Venta ventaGuardada = ventaRepository.save(venta);
        for (DetalleVentaItem item : request.getItems()) {
            Producto producto = productoRepository.findById(Objects.requireNonNull(item.getIdProducto()))
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getIdProducto()));

            BigDecimal subtotal = item.getSubtotal();
            if (subtotal == null) {
                subtotal = item.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(item.getCantidad()));
                if (item.getDescuento() != null) {
                    subtotal = subtotal.subtract(item.getDescuento());
                }
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(ventaGuardada);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecioUnitario());
            detalle.setDescuento(item.getDescuento());
            detalle.setSubTotal(subtotal);
            detalle.setFechaAlta(LocalDateTime.now());

            detalleVentaRepository.save(detalle);
        }

        return ventaGuardada;
    }

    public List<Venta> listarVentasPorSucursal(Integer idSucursal, @NonNull Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        if (idSucursal == null) {
            List<com.stockbean.stockapp.dto.UsuarioSucursalResponse> userSucursales = usuarioSucursalRepository.findByUsuarioIdUsuario(idUsuario);
            java.util.List<Integer> allowedIds = userSucursales.stream()
                    .filter(us -> Boolean.TRUE.equals(us.getStatus()))
                    .map(com.stockbean.stockapp.dto.UsuarioSucursalResponse::getIdSucursal)
                    .collect(java.util.stream.Collectors.toList());
            if (allowedIds.isEmpty()) {
                return new java.util.ArrayList<>();
            }
            return ventaRepository.findBySucursalIds(allowedIds);
        }

        validarAccesoSucursal(usuario, idSucursal);
        return ventaRepository.findBySucursalId(idSucursal);
    }

    public List<DetalleVenta> obtenerDetalleVenta(@NonNull Integer idVenta) {
        return detalleVentaRepository.findByVentaId(idVenta);
    }

    public List<MetodoPago> listarMetodosPago() {
        return metodoPagoRepository.findAll();
    }

    private void validarAccesoSucursal(Usuario usuario, @NonNull Integer idSucursal) {
        sucursalAccessService.validarAcceso(usuario, idSucursal);
    }
}
