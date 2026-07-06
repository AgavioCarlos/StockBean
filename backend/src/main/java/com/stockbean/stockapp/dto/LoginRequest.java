package com.stockbean.stockapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private Integer sucursal;
    private String cuenta;
    private String password;

}
