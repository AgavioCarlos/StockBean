import { apiFetch } from "../../services/Api";

export interface ProductoProveedorDTO {
    idProductoProveedor?: number;
    idProducto: number;
    nombreProducto?: string;
    idProveedor?: number;
    precio?: number;
    codigoProveedor?: string;
    tiempoEntrega?: number;
    status?: boolean;
}

/** Lista los productos asignados a un proveedor */
export const listarProductosProveedor = (idProveedor: number): Promise<ProductoProveedorDTO[]> =>
    apiFetch<ProductoProveedorDTO[]>(`/proveedores/${idProveedor}/productos`)
        .then(res => res || []);

/** Asigna un producto al proveedor */
export const asignarProducto = (idProveedor: number, data: ProductoProveedorDTO): Promise<ProductoProveedorDTO> =>
    apiFetch<ProductoProveedorDTO>(`/proveedores/${idProveedor}/productos`, {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        if (!res) throw new Error("Error al asignar producto");
        return res;
    });

/** Actualiza una asignación existente */
export const actualizarAsignacion = (idProveedor: number, id: number, data: ProductoProveedorDTO): Promise<ProductoProveedorDTO> =>
    apiFetch<ProductoProveedorDTO>(`/proveedores/${idProveedor}/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }).then(res => {
        if (!res) throw new Error("Error al actualizar");
        return res;
    });

/** Elimina (soft delete) una asignación */
export const desasignarProducto = (idProveedor: number, id: number): Promise<void> =>
    apiFetch<void>(`/proveedores/${idProveedor}/productos/${id}`, { method: "DELETE" })
        .then(() => undefined);
