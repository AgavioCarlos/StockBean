export interface LoginData {
  sucursal: string;
  cuenta: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  id_usuario: number;
  cuenta: string;
  id_rol: number;
  fecha_alta: string;
  id_persona?: number;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  status?: boolean;
  mensaje: string;
  token: string;
  empresa: string[];
}