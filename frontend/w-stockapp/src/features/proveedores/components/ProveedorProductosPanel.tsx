import { useState, useEffect, useMemo } from "react";
import {
    MdAdd,
    MdDelete,
    MdEdit,
    MdSave,
    MdClose,
    MdInventory2,
    MdLocalShipping
} from "react-icons/md";
import { useLOVs } from "../../../hooks/useLOVs";
import { useAlerts } from "../../../hooks/useAlerts";
import {
    ProductoProveedorDTO,
    listarProductosProveedor,
    asignarProducto,
    actualizarAsignacion,
    desasignarProducto
} from "../ProductoProveedorService";
import { StatusBadge } from "../../../components/StatusBadge";

interface Props {
    idProveedor: number | undefined;
    nombreProveedor?: string;
}

const EMPTY_FORM: ProductoProveedorDTO = {
    idProducto: 0,
    precio: 0,
    codigoProveedor: "",
    tiempoEntrega: 0
};

export function ProveedorProductosPanel({ idProveedor, nombreProveedor }: Props) {
    const { success, error: showError, confirm, warning } = useAlerts();
    const { data: lovs } = useLOVs(["productos"]);

    const [asignaciones, setAsignaciones] = useState<ProductoProveedorDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ProductoProveedorDTO>(EMPTY_FORM);

    // Productos disponibles para asignar
    const opcionesProductos = useMemo(() =>
        (lovs.productos || []).map((p: any) => ({ value: p.id_producto, label: p.nombre })),
        [lovs]
    );

    // ─── Cargar asignaciones ────────────────────────────────────────────────────
    const cargar = async () => {
        if (!idProveedor) return;
        setLoading(true);
        try {
            const data = await listarProductosProveedor(idProveedor);
            setAsignaciones(data);
        } catch {
            showError("Error", "No se pudieron cargar los productos del proveedor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idProveedor]);

    // ─── Guardar (crear o actualizar) ──────────────────────────────────────────
    const handleGuardar = async () => {
        if (!idProveedor) return;
        if (!form.idProducto) {
            warning("Atención", "Selecciona un producto para continuar.");
            return;
        }
        try {
            if (editingId) {
                await actualizarAsignacion(idProveedor, editingId, form);
                success("Actualizado", "Asignación actualizada correctamente.");
            } else {
                await asignarProducto(idProveedor, form);
                success("Asignado", "Producto asignado al proveedor correctamente.");
            }
            resetForm();
            cargar();
        } catch (err: any) {
            showError("Error", err?.message || "Ocurrió un error al guardar.");
        }
    };

    // ─── Desasignar ────────────────────────────────────────────────────────────
    const handleDesasignar = async (item: ProductoProveedorDTO) => {
        const confirmed = await confirm(
            "¿Desasignar producto?",
            `¿Deseas quitar "${item.nombreProducto}" de este proveedor?`,
            "Sí, quitar"
        );
        if (!confirmed || !idProveedor || !item.idProductoProveedor) return;

        try {
            await desasignarProducto(idProveedor, item.idProductoProveedor);
            success("Quitado", "Producto removido del proveedor.");
            cargar();
        } catch {
            showError("Error", "No se pudo desasignar el producto.");
        }
    };

    // ─── Editar inline ─────────────────────────────────────────────────────────
    const handleEditar = (item: ProductoProveedorDTO) => {
        setEditingId(item.idProductoProveedor || null);
        setForm({
            idProducto: item.idProducto,
            precio: item.precio,
            codigoProveedor: item.codigoProveedor || "",
            tiempoEntrega: item.tiempoEntrega
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setShowForm(false);
        setEditingId(null);
    };

    // ─── Empty state ───────────────────────────────────────────────────────────
    if (!idProveedor) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                <MdLocalShipping size={40} />
                <p className="text-sm font-medium">Guarda el proveedor para gestionar sus productos</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <MdInventory2 size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">
                            Catálogo de Productos
                        </h4>
                        <p className="text-xs text-slate-400">
                            {asignaciones.filter(a => a.status).length} producto(s) activo(s) para {nombreProveedor || "este proveedor"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-indigo-500/30"
                >
                    {showForm ? <MdClose size={16} /> : <MdAdd size={16} />}
                    {showForm ? "Cancelar" : "Asignar Producto"}
                </button>
            </div>

            {/* Formulario de asignación */}
            {showForm && (
                <div className="p-5 bg-indigo-50/40 border-b border-indigo-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

                    {/* Producto */}
                    <div className="lg:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            Producto *
                        </label>
                        <select
                            value={form.idProducto}
                            onChange={e => setForm({ ...form, idProducto: Number(e.target.value) })}
                            disabled={!!editingId}
                            className="w-full h-9 px-3 text-xs rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value={0}>Seleccionar producto...</option>
                            {opcionesProductos.map((p: any) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Precio */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            Precio
                        </label>
                        <input
                            type="number"
                            value={form.precio || ""}
                            onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
                            placeholder="0.00"
                            className="w-full h-9 px-3 text-xs rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                    </div>

                    {/* Código proveedor */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            Código Proveedor
                        </label>
                        <input
                            type="text"
                            value={form.codigoProveedor || ""}
                            onChange={e => setForm({ ...form, codigoProveedor: e.target.value })}
                            placeholder="SKU-001"
                            className="w-full h-9 px-3 text-xs rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleGuardar}
                            className="w-full h-9 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                        >
                            <MdSave size={16} />
                            {editingId ? "Actualizar" : "Asignar"}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabla de asignaciones */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
                        <span className="text-sm">Cargando productos...</span>
                    </div>
                ) : asignaciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                        <MdInventory2 size={36} className="opacity-30" />
                        <p className="text-sm font-medium">Sin productos asignados</p>
                        <p className="text-xs">Haz clic en "Asignar Producto" para comenzar</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50/70 border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-3 text-left">Producto</th>
                                <th className="px-5 py-3 text-left">Cód. Proveedor</th>
                                <th className="px-5 py-3 text-right">Precio</th>
                                <th className="px-5 py-3 text-center">Estado</th>
                                <th className="px-5 py-3 text-center w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {asignaciones.map(item => (
                                <tr key={item.idProductoProveedor} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="px-5 py-3 font-medium text-slate-800">
                                        {item.nombreProducto || `Producto #${item.idProducto}`}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                                        {item.codigoProveedor || <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold text-slate-700">
                                        {item.precio ? `$${Number(item.precio).toLocaleString()}` : <span className="text-slate-300 font-normal">—</span>}
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <StatusBadge status={item.status ?? true} trueText="Activo" falseText="Inactivo" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => handleEditar(item)}
                                                className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                title="Editar"
                                            >
                                                <MdEdit size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDesasignar(item)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                title="Desasignar"
                                            >
                                                <MdDelete size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
