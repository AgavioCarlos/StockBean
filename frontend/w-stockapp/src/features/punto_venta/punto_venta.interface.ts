export interface IProductoBusqueda {
    idProducto: number;
    nombre: string;
    descripcion: string;
    codigoBarras: string;
    unidad: string;
    marca: string;
    categoria: string;
    imagenUrl: string;
    precioVenta: number;
    stockDisponible: number;
    stockMinimo: number;
}

export interface ICarritoItem {
    idProducto: number;
    nombre: string;
    codigoBarras?: string;
    precioUnitario: number;
    cantidad: number;
    descuento: number;
    subtotal: number;
    stockDisponible: number;
    unidad?: string;
    imagenUrl?: string;
}

export interface IVentaRequest {
    // idSucursal: number;
    idMetodoPago: number;
    items: {
        idProducto: number;
        cantidad: number;
        precioUnitario: number;
        descuento: number;
        subtotal: number;
    }[];
}

export interface IMetodoPago {
    idMetodoPago: number;
    nombre: string;
    descripcion?: string;
    status: boolean;
}

export interface IVentaResponse {
    idVenta: number;
    idSucursal: number;
    idUsuario: number;
    fechaVenta: string;
    total: number;
    metodoPago: IMetodoPago;
    ticketUrl?: string;
}

export interface ICaja {
    idCaja: number;
    nombre: string;
    activa: boolean;
}

export interface ITurnoCaja {
    idTurno: number;
    idUsuario: number;
    idCaja: number;
    fechaApertura: string;
    montoInicial: number;
    fechaCierre?: string;
    montoEsperado?: number;
    montoReal?: number;
    diferencia?: number;
    estado: string; // 'ABIERTO' | 'CERRADO'
}

export interface IAperturaCajaRequest {
    idCaja: number;
    montoInicial: number;
}

export interface ICierreCajaRequest {
    idTurno: number;
    montoReal: number;
}

export interface IMovimientoCajaRequest {
    idTurno: number;
    tipoMovimiento: "ENTRADA" | "RETIRO";
    concepto: string;
    monto: number;
}

export interface IMovimientoCaja {
    idMovimiento: number;
    idTurno: number;
    tipoMovimiento: "ENTRADA" | "RETIRO";
    concepto: string;
    monto: number;
    fecha: string;
    idAutorizador: number;
}
