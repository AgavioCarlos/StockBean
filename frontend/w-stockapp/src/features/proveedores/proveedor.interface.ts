export interface IProveedor {
    idProveedor: number;
    nombre: string;
    direccion: string;
    email: string;
    status: boolean;
    fechaAlta?: string;
    fechaBaja?: string;
    fechaUltimaModificacion?: string;
}

export interface Proveedor {
    idProveedor: number;
    nombre: string;
    direccion: string;
    email: string;
    status: boolean;
    fechaAlta?: string;
    fechaBaja?: string;
    fechaUltimaModificacion?: string;
}
