import React from 'react';
import { DataTable, Column } from '../../../components/DataTable';
import { IoMdAddCircle } from "react-icons/io";
import { IInventario } from '../inventario.interface';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { SharedButton } from '../../../components/SharedButton';

interface InventarioListProps {
    data: IInventario[];
    columns: Column<IInventario>[];
    onRowClick: (item: IInventario) => void;
    onNew: () => void;
    idSucursal: number | "";
    onBranchChange: (id: number | "") => void;
    loading?: boolean;
}

export const InventarioList: React.FC<InventarioListProps> = ({
    data,
    columns,
    onRowClick,
    onNew,
    idSucursal,
    onBranchChange,
    loading
}) => {
    return (
        <div className="p-6 pt-2 flex flex-col h-full relative">
            <SectionHeader
                title=""
                className="border-none mb-4"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <SharedButton onClick={onNew} variant="primary" icon={<IoMdAddCircle size={20} />}></SharedButton>
                    </div>
                }
            />


            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-10">
                {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all duration-300">
                        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                        <span className="text-xs font-bold text-indigo-500/80 uppercase tracking-widest animate-pulse">Sincronizando...</span>
                    </div>
                )}

                <DataTable
                    data={data}
                    columns={columns}
                    onRowClick={onRowClick}
                />

                {data.length === 0 && !loading && (
                    <div className="p-20 text-center">
                        <p className="text-slate-400 italic text-sm">
                            {idSucursal
                                ? "No se encontraron productos en esta sucursal."
                                : "Selecciona una sucursal para ver las existencias."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
