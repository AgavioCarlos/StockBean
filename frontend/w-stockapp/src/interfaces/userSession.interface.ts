export interface UserSession {
    id_usuario: number;
    cuenta: string;
    id_rol: number;
    id_sucursal?: number;
    token: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    email?: string;
    empresa?: any[];
    permisos_crud?: Record<number, Record<string, string[]>>;
    [key: string]: any;
}