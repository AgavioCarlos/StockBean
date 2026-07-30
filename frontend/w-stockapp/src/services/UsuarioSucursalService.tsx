import { apiFetch } from "./Api";

export interface Usuario {
    id_usuario: number;
    cuenta: string;
    persona: {
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno?: string;
        email: string;
    };
}

export interface Sucursal {
    idSucursal: number;
    nombre: string;
}

export interface UsuarioSucursal {
    idUsuarioSucursal?: number;
    usuario: { id_usuario: number };
    sucursal: { idSucursal: number };
    status: boolean;
}

export interface UsuarioSucursalResponse {
    idUsuarioSucursal: number;
    id_usuario: number;
    idSucursal: number;
    nombre: string;
    direccion: string;
    status: boolean;
}

const ENDPOINT = "/usuario-sucursales";

export const asignarUsuarioSucursal = async (data: Partial<UsuarioSucursal>): Promise<UsuarioSucursal> => {
    return await apiFetch<UsuarioSucursal>(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
    }) as UsuarioSucursal;
};

export const actualizarUsuarioSucursal = async (data: UsuarioSucursal): Promise<UsuarioSucursal> => {
    return await apiFetch<UsuarioSucursal>(ENDPOINT, {
        method: "PUT",
        body: JSON.stringify(data),
    }) as UsuarioSucursal;
};

export const obtenerPorIdUsuario = async (idUsuario: number): Promise<UsuarioSucursalResponse[]> => {
    return await apiFetch<UsuarioSucursalResponse[]>(`${ENDPOINT}/${idUsuario}`) || [];
};

export const eliminarUsuarioSucursal = async (id: number): Promise<void> => {
    await apiFetch<void>(`${ENDPOINT}/${id}`, {
        method: "DELETE",
    });
};
