package com.stockbean.stockapp.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoProveedorDTO {
    private Integer idProducto;
    private BigDecimal precio;
    private String codigoProveedor;
    private Integer tiempoEntrega;
}
