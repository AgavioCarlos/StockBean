export interface Persona {
    id_persona?: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    email: string;
    status: boolean;
    fecha_alta?: string;
    password?: string;
}
