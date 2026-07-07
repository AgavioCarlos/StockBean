export interface VentaReporte {
    idVenta: number;
    fechaVenta: string;
    sucursal: string;
    idSucursal: number;
    cajero: string;
    metodoPago: string;
    totalProductos: number;
    totalVenta: number;
    cantidadItems: number;
}

export interface IDashboardStats {
    montoHoy: number;
    trendMonto: string;
    montoColor: string;

    conteoHoy: number;
    trendConteo: string;
    conteoColor: string;

    unidadesHoy: number;
    trendUnidades: string;
    unidadesColor: string;

    promedioHoy: number;
    trendPromedio: string;
    promedioColor: string;
}

export interface IVentasPorDia {
    fecha: string;
    topProducto: string;
    cantidad: number;
    totalVentas: number;
}
