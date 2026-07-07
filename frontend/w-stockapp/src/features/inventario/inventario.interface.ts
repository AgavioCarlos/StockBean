export interface inventario {
    id_inventario?: number;
    producto: {
        id_producto: number;
        nombre?: string;
        codigoBarras?: string;
    };
    sucursal: {
        idSucursal?: number;
        id_sucursal?: number;
        nombre?: string;
    };
    stock_actual: number;
    stock_minimo: number;
    status: boolean;
    precioNuevo?: number;
    precioAnterior?: number;
    idTipoPrecio?: number;
    motivo?: string;
}