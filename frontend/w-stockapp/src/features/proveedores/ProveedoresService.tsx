import { apiFetch } from "../../services/Api";
import { Proveedor } from "./proveedor.interface";

export const consultarProveedores = async (signal?: AbortSignal): Promise<Proveedor[]> => {
    const response = await apiFetch<Proveedor[]>("/proveedores", { signal });
    return response || [];
};

export const crearProveedor = async (proveedor: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await apiFetch<Proveedor>("/proveedores", {
        method: "POST",
        body: JSON.stringify(proveedor),
    });
    return response as Proveedor;
};

export const actualizarProveedor = async (id: number, proveedor: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await apiFetch<Proveedor>(`/proveedores/${id}`, {
        method: "PUT",
        body: JSON.stringify(proveedor),
    });
    return response as Proveedor;
};

export const eliminarProveedor = async (id: number, _currentItem?: any, _newStatus?: boolean): Promise<Proveedor> => {
    const response = await apiFetch<Proveedor>(`/proveedores/${id}`, {
        method: "DELETE",
    });
    return response as Proveedor;
};
