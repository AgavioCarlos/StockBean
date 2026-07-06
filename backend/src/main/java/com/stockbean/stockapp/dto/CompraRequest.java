package com.stockbean.stockapp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CompraRequest {
    private Integer idSucursal;
    private Integer idProveedor;
    private LocalDateTime fechaCompra;
    private String observaciones;
    private List<DetalleRequest> detalles;

    @Data
    public static class DetalleRequest {
        private Integer idProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private String lote;
        private String fechaCaducidad; // "yyyy-MM-dd"
    }
}
