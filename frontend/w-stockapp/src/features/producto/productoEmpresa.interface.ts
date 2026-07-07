import { Productos as IProducto } from "../Producto/producto.interface";

export interface ProductoEmpresa {
    idProductoEmpresa?: number;
    producto?: IProducto;
    precioCompra: number;
    precioVenta: number;
    costoPromedio: number;
    manejaInventario: boolean;
    permiteVenta: boolean;
    permiteCompra: boolean;
    activo: boolean;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}
