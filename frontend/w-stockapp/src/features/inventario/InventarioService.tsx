import { apiFetch } from "../../services/Api";
import type { IInventario } from "./inventario.interface";

const ENDPOINT = "/inventario";

export const consultarInventario = async (idSucursal?: number): Promise<IInventario[]> => {
    const url = idSucursal ? `${ENDPOINT}?idSucursal=${idSucursal}` : ENDPOINT;
    return await apiFetch<IInventario[]>(url) || [];
};

export const crearInventario = async (data: Partial<IInventario>): Promise<IInventario> => {
    return await apiFetch<IInventario>(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
    }) as IInventario;
};

export const actualizarInventario = async (id: number, data: Partial<IInventario>): Promise<IInventario> => {
    const payload = { ...data, id_inventario: id };
    return await apiFetch<IInventario>(`${ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    }) as IInventario;
};

export const eliminarInventario = async (id: number): Promise<void> => {
    await apiFetch<void>(`${ENDPOINT}/${id}`, {
        method: "DELETE",
    });
};
