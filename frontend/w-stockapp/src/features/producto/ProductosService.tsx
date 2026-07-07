import { apiFetch } from "../../services/Api";
import type { ProductoEmpresa } from "./productoEmpresa.interface";
import type { CrearProducto } from "./producto.interface";

export async function consultarProductos(signal?: AbortSignal) {
  console.log("Token en localStorage:", localStorage.getItem("token"));
  return apiFetch("/productos", { signal });
}

export async function crearProducto(paylod: CrearProducto): Promise<CrearProducto> {
  return apiFetch("/productos", {
    method: "POST",
    body: JSON.stringify(paylod),
  }) as Promise<CrearProducto>;
}

export async function actualizarProducto(id_producto: number, payload: {
  nombre: string;
  descripcion: string;
  idCategoria: number | null;
  idUnidad: number | null;
  idMarca: number | null;
  codigoBarras: string;
  imagenUrl: string;
  status: boolean;
}) {
  return apiFetch(`/productos/${id_producto}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}


export async function eliminarProducto(id: number) {
  return apiFetch(`/productos/${id}`, {
    method: "DELETE",
  });
}

// PRODUCTO EMPRESA

export async function consultarProductoEmpresas(signal?: AbortSignal): Promise<ProductoEmpresa[]> {
  return apiFetch("/producto-empresa", { signal }) as Promise<ProductoEmpresa[]>;
}

export async function crearProductoEmpresa(payload: Partial<ProductoEmpresa>): Promise<ProductoEmpresa> {
  return apiFetch("/producto-empresa", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ProductoEmpresa>;
}

export async function actualizarProductoEmpresa(id: number, payload: Partial<ProductoEmpresa>): Promise<ProductoEmpresa> {
  return apiFetch(`/producto-empresa/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  }) as Promise<ProductoEmpresa>;
}

export async function eliminarProductoEmpresa(id: number) {
  return apiFetch(`/producto-empresa/${id}`, {
    method: "DELETE",
  });
}
