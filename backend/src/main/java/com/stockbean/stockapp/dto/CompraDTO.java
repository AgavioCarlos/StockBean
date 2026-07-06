package com.stockbean.stockapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraDTO {
    private Integer idCompra;
    private Integer idSucursal;
    private String nombreSucursal;
    private Integer idProveedor;
    private String nombreProveedor;
    private LocalDateTime fechaCompra;
    private Integer total;
    private String observaciones;
    private List<DetalleDTO> detalles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleDTO {
        private Integer idDetalleCompra;
        private Integer idProducto;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        private String lote;
        private String fechaCaducidad; // ISO string for frontend
    }
}
