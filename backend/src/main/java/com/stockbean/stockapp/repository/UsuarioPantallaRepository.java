package com.stockbean.stockapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stockbean.stockapp.model.admin.AdminUsuarioPantalla;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface UsuarioPantallaRepository extends JpaRepository<AdminUsuarioPantalla, Integer> {
    @Modifying
    @Query("DELETE FROM AdminUsuarioPantalla a WHERE a.usuario.id_usuario = :idUsuario AND a.empresa.idEmpresa = :idEmpresa")
    void deleteByUsuarioIdAndEmpresaId(@Param("idUsuario") Integer idUsuario, @Param("idEmpresa") Integer idEmpresa);

    @Query("SELECT a FROM AdminUsuarioPantalla a " +
            "INNER JOIN UsuarioSucursal us ON (us.usuario.id_usuario = a.usuario.id_usuario) " +
            "WHERE a.usuario.id_usuario = :idUsuario " + 
            "AND us.sucursal.idSucursal = :idSucursal")
    List<AdminUsuarioPantalla> findByUsuarioIdAndEmpresaId(@Param("idUsuario") Integer idUsuario, @Param("idSucursal") Integer idSucursal);

    @Query("SELECT a FROM AdminUsuarioPantalla a " + 
            "INNER JOIN UsuarioSucursal us ON (us.usuario.id_usuario = a.usuario.id_usuario) " +
            "WHERE a.usuario.id_usuario = :idUsuario " + 
            "AND us.sucursal.idSucursal = :idSucursal")
    List<AdminUsuarioPantalla> findByUsuarioId(@Param("idUsuario") Integer idUsuario, @Param("idSucursal") Integer idSucursal);

    @Query("SELECT a FROM AdminUsuarioPantalla a WHERE a.usuario.id_usuario = :idUsuario")
    List<AdminUsuarioPantalla> findByUsuarioIdDirecto(@Param("idUsuario") Integer idUsuario);
}
