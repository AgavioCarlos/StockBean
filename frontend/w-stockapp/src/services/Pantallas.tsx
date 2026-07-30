import { Pantalla } from "../interfaces/pantalla.interface";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const getPantallasUsuario = async (sucursal: string): Promise<Pantalla[]> => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay token de autenticación");
    }
    const response = await fetch(`${API_BASE_URL}/pantallas/${sucursal}}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Error al obtener las pantallas del usuario");
    }

    const pantallas: Pantalla[] = await response.json();
    return pantallas;
};

export const savePantallasToLocalStorage = (pantallas: Pantalla[]): void => {
    localStorage.setItem("pantallas", JSON.stringify(pantallas));
};

export const getPantallasFromLocalStorage = (): Pantalla[] | null => {
    const pantallasStr = localStorage.getItem("pantallas");
    if (!pantallasStr) return null;

    try {
        return JSON.parse(pantallasStr) as Pantalla[];
    } catch {
        return null;
    }
};

/**
 * Limpia las pantallas del localStorage
 * Debe ejecutarse al cerrar sesión
 */
export const clearPantallasFromLocalStorage = (): void => {
    localStorage.removeItem("pantallas");
};
