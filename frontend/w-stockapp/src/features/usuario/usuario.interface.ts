export interface Persona {
    id_persona?: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    email: string;
    status: boolean;
    fecha_alta?: string;
}

export interface Usuario {
    id_usuario?: number;
    persona: Persona;
    cuenta: string;
    id_rol: number;
    status: boolean;
    password?: string;

}

export interface UsuarioFormProps {
    values: any;
    handleChange: (e: any) => void;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onSave: (e: React.FormEvent) => void;
    onNew: () => void;
    selection: Usuario | null;
    onToggleStatus: (item: Usuario) => void;
}
