package com.stockbean.stockapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stockbean.stockapp.model.tablas.Inventario;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

        @Query("SELECT i FROM Inventario i " +
                        "JOIN FETCH i.producto " +
                        "JOIN FETCH i.sucursal " +
                        "WHERE i.sucursal.idSucursal = :idSucursal " +
                        "AND i.status = true " +
                        "AND i.producto.status = true")
        List<Inventario> findBySucursalIdAndStatusTrue(@Param("idSucursal") Integer idSucursal);

        @Query("SELECT i FROM Inventario i " +
                        "JOIN FETCH i.producto " +
                        "JOIN FETCH i.sucursal " +
                        "WHERE i.sucursal.idSucursal IN :idsSucursales " +
                        "AND i.status = true " +
                        "AND i.producto.status = true")
        List<Inventario> findBySucursalIdsAndStatusTrue(@Param("idsSucursales") List<Integer> idsSucursales);

        // POS: Buscar producto por código de barras en una sucursal
        @Query("SELECT i FROM Inventario i " +
                        "JOIN FETCH i.producto p " +
                        "JOIN FETCH i.sucursal " +
                        "WHERE i.sucursal.idSucursal = :idSucursal " +
                        "AND p.codigoBarras = :codigoBarras " +
                        "AND i.status = true " +
                        "AND p.status = true")
        List<Inventario> findByCodigoBarrasAndSucursal(
                        @Param("codigoBarras") String codigoBarras,
                        @Param("idSucursal") Integer idSucursal);

        // POS: Buscar productos por nombre (LIKE) en una sucursal
        @Query("SELECT i FROM Inventario i " +
                        "JOIN FETCH i.producto p " +
                        "JOIN FETCH i.sucursal " +
                        "WHERE i.sucursal.idSucursal = :idSucursal " +
                        "AND LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) " +
                        "AND i.status = true " +
                        "AND p.status = true")
        List<Inventario> findByNombreProductoAndSucursal(
                        @Param("nombre") String nombre,
                        @Param("idSucursal") Integer idSucursal);

        // POS: Obtener inventario de un producto específico en una sucursal
        @Query("SELECT i FROM Inventario i " +
                        "JOIN FETCH i.producto p " +
                        "JOIN FETCH i.sucursal " +
                        "WHERE i.sucursal.idSucursal = :idSucursal " +
                        "AND p.id_producto = :idProducto " +
                        "AND i.status = true " +
                        "AND p.status = true")
        List<Inventario> findByProductoAndSucursal(
                        @Param("idProducto") Integer idProducto,
                        @Param("idSucursal") Integer idSucursal);
}
