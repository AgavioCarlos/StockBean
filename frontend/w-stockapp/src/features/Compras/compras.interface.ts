export interface DetalleCompra {
    idDetalleCompra?: number;
    idProducto: number;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    lote?: string;
    fechaCaducidad?: string;
}

export interface Compra {
    idCompra?: number;
    idSucursal: number;
    nombreSucursal?: string;
    idProveedor: number;
    nombreProveedor?: string;
    fechaCompra: string;
    total: number;
    observaciones: string;
    detalles: DetalleCompra[];
}

export interface ComprasFormProps {
    values: Partial<Compra>;
    setValues: (values: Partial<Compra>) => void;
    isEditing: boolean;
    onBranchChange: (id: number | "") => void;
    onProveedorChange: (id: number | "") => void;
}

export interface ProductoProveedor {
    idProductoProveedor: number;
    idProducto: number;
    nombreProducto: string;
    precio: number;
    codigoProveedor?: string;
    tiempoEntrega?: number;
}
