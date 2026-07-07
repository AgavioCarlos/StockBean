import { apiFetch } from "../../services/Api";
import { Sucursal } from "../../interfaces/sucursal.interface";
export type { Sucursal };

const API_URL = "/sucursales";


export const consultarSucursales = async (): Promise<Sucursal[]> => {
    try {
        const data = await apiFetch<Sucursal[]>(API_URL);
        return data || [];
    } catch (error) {
        console.error("Error al consultar sucursales", error);
        return [];
    }
};

export const consultarSucursalesPorSolicitante = async (): Promise<Sucursal[]> => {
    try {
        const data = await apiFetch<Sucursal[]>(`${API_URL}/user`);
        return data || [];
    } catch (error) {
        console.error("Error al consultar sucursales", error);
        return [];
    }
};

export const consultarSucursalesPorEmpresa = async (idEmpresa: number): Promise<Sucursal[]> => {
    try {
        const data = await apiFetch<Sucursal[]>(`${API_URL}/empresa/${idEmpresa}`);
        return data || [];
    } catch (error) {
        console.error("Error al consultar sucursales por empresa", error);
        return [];
    }
};

export const crearSucursal = async (sucursal: Partial<Sucursal>): Promise<Sucursal> => {
    try {
        const data = await apiFetch<Sucursal>(API_URL, {
            method: "POST",
            body: JSON.stringify(sucursal),
        });
        if (!data) throw new Error("No data returned");
        return data;
    } catch (error) {
        console.error("Error al crear sucursal", error);
        throw error;
    }
};

export const actualizarSucursal = async (id: number, sucursal: Partial<Sucursal>): Promise<Sucursal> => {
    try {
        const data = await apiFetch<Sucursal>(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(sucursal),
        });
        if (!data) throw new Error("No data returned");
        return data;
    } catch (error) {
        console.error("Error al actualizar sucursal", error);
        throw error;
    }
};

export const eliminarSucursal = async (id: number, currentItem: any, newStatus: boolean): Promise<Sucursal> => {
    return actualizarSucursal(id, { ...currentItem, status: newStatus });
};
