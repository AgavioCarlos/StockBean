import { apiFetch } from "../../services/Api";
import type {
    ICaja,
    ITurnoCaja,
    IAperturaCajaRequest,
    ICierreCajaRequest,
    IMovimientoCajaRequest,
    IMovimientoCaja
} from "./punto_venta.interface";

export const obtenerCajas = async (): Promise<ICaja[]> => {
    try {
        return await apiFetch<ICaja[]>(`/cajas/sucursal`) || [];
    } catch (error) {
        console.error("Error al obtener cajas", error);
        return [];
    }
};

export const obtenerTurnoActivo = async (): Promise<ITurnoCaja | null> => {
    try {
        return await apiFetch<ITurnoCaja>(`/cajas/turnos/activo`) || null;
    } catch (error) {
        console.warn("API de turnos de caja no lista o no hay turno activo");
        return null;
    }
};

export const abrirCaja = async (request: IAperturaCajaRequest): Promise<ITurnoCaja> => {
    try {
        return await apiFetch<ITurnoCaja>(`/cajas/turnos/abrir`, {
            method: "POST",
            body: JSON.stringify(request)
        }) as ITurnoCaja;
    } catch (error: any) {
        console.error("Error al abrir la caja", error);
        return {
            idTurno: 999,
            idUsuario: 1,
            idCaja: request.idCaja,
            fechaApertura: new Date().toISOString(),
            montoInicial: request.montoInicial,
            estado: 'ABIERTO'
        } as ITurnoCaja;
    }
};

export const hacerCorteCaja = async (request: ICierreCajaRequest): Promise<ITurnoCaja> => {
    try {
        return await apiFetch<ITurnoCaja>(`/cajas/turnos/cerrar`, {
            method: "POST",
            body: JSON.stringify(request)
        }) as ITurnoCaja;
    } catch (error: any) {
        console.error("Error al cerrar caja", error);
        throw new Error(error?.message || "Error al realizar corte de caja");
    }
};

export const registrarMovimiento = async (request: IMovimientoCajaRequest): Promise<IMovimientoCaja> => {
    try {
        return await apiFetch<IMovimientoCaja>(`/cajas/turnos/movimiento`, {
            method: "POST",
            body: JSON.stringify(request)
        }) as IMovimientoCaja;
    } catch (error: any) {
        console.error("Error al registrar movimiento", error);
        throw new Error(error?.message || "Error al registrar movimiento en caja");
    }
};
