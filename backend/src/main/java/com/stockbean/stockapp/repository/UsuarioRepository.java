package com.stockbean.stockapp.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.stockbean.stockapp.model.tablas.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByCuenta(String cuenta);

    @Query("SELECT u FROM Usuario u, EmpresaUsuario eu WHERE u.id_usuario = eu.usuario.id_usuario AND eu.empresa.idEmpresa = :idEmpresa")
    List<Usuario> findByEmpresaId(@Param("idEmpresa") Integer idEmpresa);

    @Query("SELECT u FROM Usuario u, UsuarioSucursal us WHERE u.id_usuario = us.usuario.id_usuario AND us.sucursal.idSucursal = :idSucursal AND u.cuenta = :cuenta AND us.status = true")
    List<Usuario> findByCuentaSucursal(@Param("cuenta") String cuenta, @Param("idSucursal") Integer idSucursal);

    @Query("SELECT u FROM Usuario u WHERE u.persona.id_persona = :idPersona")
    Optional<Usuario> findByPersonaId(@Param("idPersona") Integer idPersona);
}
