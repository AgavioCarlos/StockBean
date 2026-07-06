package com.stockbean.stockapp.security;

import com.stockbean.stockapp.model.tablas.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.NonNull;
import java.util.Collection;
import java.util.Collections;

public class UsuarioPrincipal implements UserDetails {

    private final Usuario usuario;
    private final Collection<? extends GrantedAuthority> authorities;
    private Integer idSucursal;

    public UsuarioPrincipal(@NonNull Usuario usuario) {
        this.usuario = usuario;
        String roleName = "ROLE_" + usuario.getRol().getNombre().toUpperCase();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    public Integer getId() {
        return usuario.getId_usuario();
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Integer getIdSucursal() {
        return idSucursal;
    }

    public void setIdSucursal(Integer idSucursal) {
        this.idSucursal = idSucursal;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getCuenta();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return usuario.getStatus() != null && usuario.getStatus();
    }
}
