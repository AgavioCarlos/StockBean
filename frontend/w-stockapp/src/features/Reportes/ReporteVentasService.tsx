import { apiFetch } from "../../services/Api";
import type { VentaReporte, IDashboardStats, IVentasPorDia } from "./reporte_ventas.interface";

const ENDPOINT = "/reportes/ventas";

/**
 * Obtener reporte de ventas agrupado por día para el perfil.
 */
export const obtenerVentasPorDia = async (): Promise<IVentasPorDia[]> => {
    return await apiFetch<IVentasPorDia[]>(`${ENDPOINT}/por-dia`) || [];
};

/**
 * Obtener estadísticas consolidadas para el Dashboard.
 */
export const obtenerStatsDashboard = async (): Promise<IDashboardStats> => {
    return await apiFetch<IDashboardStats>(`${ENDPOINT}/stats`) as IDashboardStats;
};

/**
 * Obtener reporte de todas las ventas (filtrado por rol en el backend).
 */
export const obtenerReporteVentas = async (): Promise<VentaReporte[]> => {
    return await apiFetch<VentaReporte[]>(ENDPOINT) || [];
};

/**
 * Obtener reporte filtrado por una sucursal específica.
 */
export const obtenerReportePorSucursal = async (idSucursal: number): Promise<VentaReporte[]> => {
    return await apiFetch<VentaReporte[]>(`${ENDPOINT}/sucursal/${idSucursal}`) || [];
};
