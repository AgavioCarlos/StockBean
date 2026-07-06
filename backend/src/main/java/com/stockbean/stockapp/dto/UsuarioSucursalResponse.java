package com.stockbean.stockapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioSucursalResponse {
    private Integer idUsuarioSucursal;
    private Integer id_usuario;
    private Integer idSucursal;
    private String nombre;
    private String direccion;
    private Boolean status;
}
