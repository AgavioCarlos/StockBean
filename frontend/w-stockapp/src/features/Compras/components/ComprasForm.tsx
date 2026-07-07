import { useState, useMemo, useEffect } from "react";
import { DetalleCompra } from "../compras.interface";
import { apiFetch } from "../../../services/Api";
import { DataTable, Column } from "../../../components/DataTable";
import { SharedButton } from "../../../components/SharedButton";
import {
    HiOutlinePlusCircle,
    HiOutlineTrash,
    HiOutlineCube,
    HiOutlineMapPin,
    HiOutlineDocumentText
} from "react-icons/hi2";
import { useAlerts } from "../../../hooks/useAlerts";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { BranchSelect } from "../../../components/BranchSelect";
import { SupplierSelect } from "../../../components/SupplierSelect";
import { ComprasFormProps, ProductoProveedor } from "../compras.interface";

export function ComprasForm({ values, setValues, isEditing, onBranchChange, onProveedorChange }: ComprasFormProps) {
    const { warning } = useAlerts();

    // Productos del proveedor seleccionado
    const [productosProveedor, setProductosProveedor] = useState<ProductoProveedor[]>([]);
    const [loadingProductos, setLoadingProductos] = useState(false);

    // Cargar productos cuando cambie el proveedor
    useEffect(() => {
        if (!values.idProveedor || values.idProveedor === 0) {
            setProductosProveedor([]);
            return;
        }
        setLoadingProductos(true);
        apiFetch<ProductoProveedor[]>(`/proveedores/${values.idProveedor}/productos/activos`)
            .then((res) => setProductosProveedor(res || []))
            .catch(() => setProductosProveedor([]))
            .finally(() => setLoadingProductos(false));
    }, [values.idProveedor]);

    // Opciones de productos filtrados
    const productOptions = useMemo(() => productosProveedor.map((p) => ({
        value: Number(p.idProducto ?? 0),
        label: p.nombreProducto,
        description: p.precio ? `Precio cat.: $${p.precio.toLocaleString()}` : undefined,
        precio: Number(p.precio ?? 0)
    })), [productosProveedor]);

    const [newItem, setNewItem] = useState<DetalleCompra>({
        idProducto: 0,
        cantidad: 1,
        precioUnitario: 0,
        subtotal: 0,
        lote: "",
        fechaCaducidad: undefined
    });

    const handleAddItem = () => {
        if (!newItem.idProducto || newItem.cantidad <= 0 || newItem.precioUnitario <= 0) {
            warning("Atención", "Completa producto, cantidad y precio.");
            return;
        }
        const prodObj = productOptions.find(p => p.value === newItem.idProducto);
        const item: DetalleCompra = {
            ...newItem,
            nombreProducto: prodObj?.label,
            subtotal: newItem.cantidad * newItem.precioUnitario
        };
        const nuevasLineas = [...(values.detalles || []), item];
        setValues({
            ...values,
            detalles: nuevasLineas,
            total: nuevasLineas.reduce((acc, curr) => acc + curr.subtotal, 0)
        });
        setNewItem({ idProducto: 0, cantidad: 1, precioUnitario: 0, subtotal: 0, lote: "", fechaCaducidad: undefined });
    };

    const columns = useMemo<Column<DetalleCompra>[]>(() => [
        { key: "nombreProducto", label: "Producto" },
        { key: "cantidad", label: "Cant." },
        { key: "precioUnitario", label: "Precio U.", render: (v) => `$${(v ?? 0).toLocaleString()}` },
        { key: "subtotal", label: "Subtotal", render: (v) => <span className="font-bold text-indigo-600">${(v ?? 0).toLocaleString()}</span> },
        { key: "lote", label: "Lote/Cad.", render: (_, item) => <span className="text-[10px] text-slate-400">L: {item.lote || "—"} / C: {item.fechaCaducidad || "—"}</span> },
        { key: "idDetalleCompra" as any, label: "", render: (_, item) => isEditing && (
            <button type="button" onClick={() => setValues({ ...values, detalles: values.detalles?.filter(d => d !== item), total: (values.total || 0) - item.subtotal })} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                <HiOutlineTrash size={18} />
            </button>
        )}
    ], [isEditing, values, setValues]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm items-end z-30">
                <BranchSelect 
                    value={values.idSucursal || ""} 
                    onChange={onBranchChange} 
                    disabled={!isEditing || !!values.idCompra}
                />
                
                <SupplierSelect 
                    value={values.idProveedor || ""} 
                    onChange={(val) => {
                        onProveedorChange(val);
                        setValues({ ...values, idProveedor: Number(val), detalles: [] });
                    }} 
                    disabled={!isEditing || !!values.idCompra}
                />

                <div className="space-y-1.5 mb-[2px]">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha</label>
                    <input type="date" value={values.fechaCompra ? String(values.fechaCompra).slice(0, 10) : ''}
                        onChange={(e) => setValues({ ...values, fechaCompra: e.target.value ? `${e.target.value}T12:00:00` : '' })}
                        disabled={!isEditing} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all focus:outline-none text-sm" />
                </div>

                <div className="space-y-1.5 mb-[2px]">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Notas</label>
                    <input type="text" value={values.observaciones || ""} onChange={(e) => setValues({ ...values, observaciones: e.target.value })}
                        disabled={!isEditing} placeholder="..." className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all focus:outline-none text-sm" />
                </div>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-inner z-20">
                    {!values.idProveedor ? (
                        <p className="text-sm text-slate-400 text-center italic">Selecciona un proveedor para cargar sus productos.</p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                            <div className="lg:col-span-4">
                                <SearchableSelect label="Añadir Producto" options={productOptions} value={newItem.idProducto || ""} 
                                    onChange={(v) => {
                                        const p = productOptions.find(o => o.value === v);
                                        setNewItem({ ...newItem, idProducto: Number(v), precioUnitario: p?.precio ?? 0 });
                                    }} />
                            </div>
                            <div className="lg:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cant.</label>
                                <input type="number" value={newItem.cantidad} onChange={(e) => setNewItem({ ...newItem, cantidad: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div className="lg:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Precio U.</label>
                                <input type="number" step="0.01" value={newItem.precioUnitario} onChange={(e) => setNewItem({ ...newItem, precioUnitario: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div className="lg:col-span-3 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Lote</label>
                                <input type="text" value={newItem.lote} onChange={(e) => setNewItem({ ...newItem, lote: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div className="lg:col-span-1">
                                <SharedButton title="" icon={<HiOutlinePlusCircle size={24} />} onClick={handleAddItem} className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 rounded-xl transition-all" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 italic uppercase tracking-widest"><HiOutlineCube className="text-indigo-500" /> Detalle</h3>
                    <div className="text-sm font-bold text-slate-400">Total: <span className="text-indigo-600 text-xl font-black ml-2">${(values.total || 0).toLocaleString()}</span></div>
                </div>
                <DataTable data={values.detalles || []} columns={columns} />
            </div>
        </div>
    );
}
