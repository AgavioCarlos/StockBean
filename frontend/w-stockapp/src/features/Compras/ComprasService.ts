import { apiFetch } from "../../services/Api";
import { Compra } from "./compras.interface";

export const consultarCompras = (): Promise<Compra[]> => 
    apiFetch<Compra[]>("/compras").then(res => res || []);

export const obtenerCompraPorId = (id: number): Promise<Compra> => 
    apiFetch<Compra>(`/compras/${id}`).then(res => {
        if (!res) throw new Error("Compra no encontrada");
        return res;
    });

/**
 * Registra una compra. 
 * Se usa Partial<Compra> para ser compatible con useCRUD.
 */
export const registrarCompra = (payload: Partial<Compra>): Promise<Compra> => 
    apiFetch<Compra>("/compras", {
        method: "POST",
        body: JSON.stringify(payload)
    }).then(res => {
        if (!res) throw new Error("Error al registrar compra");
        return res;
    });

/**
 * Actualiza una compra.
 * Se usa Partial<Compra> para ser compatible con useCRUD.
 */
export const actualizarCompra = (id: number, payload: Partial<Compra>): Promise<Compra> => 
    apiFetch<Compra>(`/compras/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    }).then(res => {
        if (!res) throw new Error("Error al actualizar compra");
        return res;
    });
