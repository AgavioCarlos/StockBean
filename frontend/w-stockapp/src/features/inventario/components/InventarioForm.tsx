import React from 'react';
import { BranchSelect } from '../../../components/BranchSelect';
import { SearchableSelect } from '../../../components/SearchableSelect';
import { SharedButton } from '../../../components/SharedButton';
import { HiOutlinePlusCircle } from 'react-icons/hi2';
import { HiOutlineSave } from 'react-icons/hi';
import { SectionHeader } from '../../../components/ui';
import { IoMdAddCircle } from 'react-icons/io';

interface InventarioFormProps {
    values: any;
    handleChange: (e: any) => void;
    setValues: (values: any) => void;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onSave: (e: React.FormEvent) => void;
    onNew: () => void;
    selection: any;
    productosList: any[];
    tipoPreciosList: any[];
    loadingLovs?: boolean;
    idSucursal: number | "";
    onBranchChange: (id: number | "") => void;
}

export const InventarioForm: React.FC<InventarioFormProps> = ({
    values,
    handleChange,
    setValues,
    isEditing,
    onSave,
    onNew,
    selection,
    productosList,
    tipoPreciosList,
    loadingLovs,
    idSucursal,
    onBranchChange
}) => {

    const productOptions = React.useMemo(() => (productosList || []).map(p => ({
        value: p.id_producto || p.idProducto,
        label: p.nombre,
        description: p.codigoBarras ? `Barras: ${p.codigoBarras}` : undefined
    })), [productosList]);

    // Mapeo de tipo de precios
    const priceTypeOptions = React.useMemo(() => (tipoPreciosList || []).map(t => ({
        value: t.id_tipo_precio || t.idTipoPrecio,
        label: t.nombre,
        description: t.porcentaje ? `Margen: ${t.porcentaje}%` : undefined
    })), [tipoPreciosList]);

    return (
        <form onSubmit={onSave} className="space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title=""
                className="border-none mb-4"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        {/* guardar inoco guardar */}
                        <SharedButton onClick={onSave} variant="primary" icon={<HiOutlineSave size={20} />} />
                    </div>
                }
            />
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 rounded-3xl border transition-all duration-500
                ${isEditing ? 'bg-white border-slate-100 shadow-xl' : 'bg-slate-50/50 border-transparent shadow-none'}`}>

                <div className="lg:col-span-12">
                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Información del Producto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8">
                            <SearchableSelect
                                label="Producto"
                                options={productOptions}
                                value={values.idProducto}
                                onChange={(val) => setValues({ ...values, idProducto: Number(val) })}
                                disabled={!isEditing}
                                placeholder="Escribe para buscar un producto..."
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <SearchableSelect
                                label="Tipo de Precio"
                                options={priceTypeOptions}
                                value={values.idTipoPrecio}
                                onChange={(val) => setValues({ ...values, idTipoPrecio: Number(val) })}
                                disabled={!isEditing}
                                placeholder="Elegir modalidad..."
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 h-px bg-slate-100 my-2"></div>

                <div className="lg:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Actual</label>
                    <input type="number" name="stockActual" value={values.stockActual} onChange={handleChange} disabled={!isEditing}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all font-bold text-slate-700 bg-white shadow-sm" />
                </div>

                <div className="lg:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Mínimo</label>
                    <input type="number" name="stockMinimo" value={values.stockMinimo} onChange={handleChange} disabled={!isEditing}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all text-slate-700 bg-white shadow-sm" />
                </div>

                <div className="lg:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Precio Compra</label>
                    <input type="number" step="0.01" name="precioCompra" value={values.precioCompra} onChange={handleChange} disabled={!isEditing}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all text-slate-700 bg-white shadow-sm" />
                </div>

                <div className="lg:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-indigo-600">Precio Venta</label>
                    <input type="number" step="0.01" name="precioVenta" value={values.precioVenta} onChange={handleChange} disabled={!isEditing}
                        className="w-full h-11 px-4 rounded-xl border border-indigo-200 focus:ring-4 focus:ring-indigo-100 transition-all font-black text-indigo-700 bg-indigo-50/30 text-lg shadow-sm" />
                </div>
            </div>
        </form>
    );
};
