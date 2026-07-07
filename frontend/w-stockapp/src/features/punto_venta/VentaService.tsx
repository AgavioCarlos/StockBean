import { apiFetch } from "../../services/Api";
import type { IProductoBusqueda, IVentaRequest, IVentaResponse, IMetodoPago } from "./punto_venta.interface";

const ENDPOINT = "/ventas";

/**
 * Buscar producto por código de barras en una sucursal
 */
export const buscarPorCodigoBarras = async (
    idSucursal: number,
    codigoBarras: string
): Promise<IProductoBusqueda[]> => {
    return await apiFetch<IProductoBusqueda[]>(
        `${ENDPOINT}/buscar-producto?idSucursal=${idSucursal}&codigoBarras=${encodeURIComponent(codigoBarras)}`
    ) || [];
};

export const buscarPorNombre = async (nombre: string): Promise<IProductoBusqueda[]> => {
    return await apiFetch<IProductoBusqueda[]>(
        `${ENDPOINT}/buscar-producto?nombre=${encodeURIComponent(nombre)}`
    ) || [];
};

/**
 * Registrar una venta completa
 */
export const registrarVenta = async (data: IVentaRequest): Promise<IVentaResponse> => {
    return await apiFetch<IVentaResponse>(`${ENDPOINT}/registrar`, {
        method: "POST",
        body: JSON.stringify(data),
    }) as IVentaResponse;
};

/**
 * Obtener métodos de pago disponibles
 */
export const obtenerMetodosPago = async (): Promise<IMetodoPago[]> => {
    return await apiFetch<IMetodoPago[]>(`${ENDPOINT}/metodos-pago`) || [];
};
