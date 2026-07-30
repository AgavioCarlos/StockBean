
import { apiFetch } from "./Api";
import { Categoria } from "../interfaces/categoria.interface";

export async function Roles(signal?: AbortSignal) {
    return apiFetch("/roles", { signal });
}

export async function Unidades() {
    return apiFetch("/unidades");
}

export async function Productos(signal?: AbortSignal) {
    return apiFetch("/productos", { signal });
}

export async function Sucursales(signal?: AbortSignal) {
    return apiFetch("/sucursales", { signal });
}

export async function Categorias(signal?: AbortSignal) {
    return apiFetch("/categorias", { signal });
}

export async function CategoriasAsignadas(signal?: AbortSignal): Promise<Categoria[]> {
    const idEmpresa = localStorage.getItem("id_empresa") || "0";
    const res = await apiFetch<Categoria[]>(`/empres-categorias/asignacion?idEmpresa=${idEmpresa}`, { signal });
    return res || [];
}

export async function Marcas(signal?: AbortSignal) {
    return apiFetch("/marcas", { signal });
}

export async function TipoPrecios(signal?: AbortSignal) {
    return apiFetch("/tipos-precio", { signal });
}

export async function PantallasPadres(signal?: AbortSignal) {
    return apiFetch("/pantallas/padres", { signal });
}

export async function Proveedores(signal?: AbortSignal) {
    return apiFetch("/proveedores", { signal });
}