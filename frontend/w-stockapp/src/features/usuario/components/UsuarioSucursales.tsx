import React, { useState, useEffect, useCallback } from 'react';
import { MdStore, MdCheckBox, MdCheckBoxOutlineBlank, MdSecurity } from 'react-icons/md';
import { consultarSucursales } from '../../Sucursal/SucursalService';
import { obtenerPorIdUsuario, asignarUsuarioSucursal, actualizarUsuarioSucursal, UsuarioSucursalResponse } from '../../../services/UsuarioSucursalService';
import Swal from 'sweetalert2';
import Tabs from '../../../components/Tabs';
import { UsuarioPermisos } from './UsuarioPermisos';

interface UsuarioSucursalesProps {
    idUsuario: number;
}
export const UsuarioSucursales: React.FC<UsuarioSucursalesProps> = ({ idUsuario }) => {
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [asignaciones, setAsignaciones] = useState<UsuarioSucursalResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("sucursales");
    const [selectedSucursalPermisos, setSelectedSucursalPermisos] = useState<number | string>("");

    const cargarDatos = useCallback(async () => {
        if (!idUsuario) return;
        setLoading(true);
        try {
            const [todas, misAsignaciones] = await Promise.all([
                consultarSucursales(),
                obtenerPorIdUsuario(idUsuario)
            ]);
            setSucursales(todas);
            setAsignaciones(misAsignaciones);
        } catch (error) {
            console.error("Error al cargar sucursales:", error);
        } finally {
            setLoading(false);
        }
    }, [idUsuario]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleToggle = async (idSucursal: number) => {
        const asignacion = asignaciones.find(a => a.idSucursal === idSucursal);

        try {
            if (asignacion) {
                await actualizarUsuarioSucursal({
                    idUsuarioSucursal: asignacion.idUsuarioSucursal,
                    usuario: { id_usuario: idUsuario },
                    sucursal: { idSucursal: idSucursal },
                    status: !asignacion.status
                } as any);
            } else {
                await asignarUsuarioSucursal({
                    usuario: { id_usuario: idUsuario },
                    sucursal: { idSucursal: idSucursal },
                    status: true
                } as any);
            }
            await cargarDatos();
            Swal.fire({
                icon: 'success',
                title: '¡Cambio guardado!',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error("Error al cambiar asignación:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la sucursal.'
            });
        }
    };

    if (!idUsuario) return null;

    const sucursalesAsignadas = sucursales.filter(sucursal => {
        const id_sucursal = sucursal.id_sucursal || sucursal.idSucursal;
        const asignacion = asignaciones.find(a => a.idSucursal === id_sucursal);
        return asignacion?.status ?? false;
    });

    const items = [
        {
            key: "sucursales",
            label: "Sucursales",
            icon: <MdStore aria-hidden="true" />,
            content: (
                <div className="p-6 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                            <span className="text-xs font-medium text-slate-500">Cargando sucursales…</span>
                        </div>
                    ) : sucursales.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-4">No hay sucursales registradas.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-1/3">
                                        Sucursal
                                    </th>
                                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-1/2">
                                        Dirección
                                    </th>
                                    <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-1/6">
                                        Asignada
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sucursales.map(sucursal => {
                                    const id_sucursal = sucursal.id_sucursal || sucursal.idSucursal;
                                    const asignacion = asignaciones.find(a => a.idSucursal === id_sucursal);
                                    const isActive = asignacion?.status ?? false;

                                    return (
                                        <tr 
                                            key={id_sucursal} 
                                            onClick={() => {
                                                if (isActive) {
                                                    setSelectedSucursalPermisos(id_sucursal);
                                                    setActiveTab("permisos");
                                                } else {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Sucursal no asignada',
                                                        text: 'Debe asignar esta sucursal al usuario antes de poder configurar sus permisos.',
                                                        timer: 2500,
                                                        showConfirmButton: false,
                                                        toast: true,
                                                        position: 'top-end'
                                                    });
                                                }
                                            }}
                                            className={`border-b border-slate-50 transition-colors cursor-pointer ${isActive ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="px-4 py-3.5">
                                                <span className={`font-semibold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                                    {sucursal.nombre}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs text-slate-500 truncate max-w-xs block">
                                                    {sucursal.direccion}
                                                </span>
                                            </td>
                                            <td className="text-center px-4 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggle(id_sucursal);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 mx-auto block ${isActive ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                                                    title={isActive ? 'Quitar acceso' : 'Asignar acceso'}
                                                >
                                                    {isActive ? <MdCheckBox size={24} /> : <MdCheckBoxOutlineBlank size={24} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )
        },
        {
            key: "permisos",
            label: "Permisos",
            icon: <MdSecurity aria-hidden="true" />,
            content: (
                <div className="p-6">
                    {sucursalesAsignadas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <MdSecurity size={40} className="mb-3 opacity-40" />
                            <p className="text-sm font-medium">Debe asignar al menos una sucursal al usuario para gestionar sus permisos.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {selectedSucursalPermisos ? (
                                <UsuarioPermisos idUsuario={idUsuario} idSucursal={Number(selectedSucursalPermisos)} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <MdSecurity size={48} className="mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">Seleccione una sucursal de la lista superior</p>
                                    <p className="text-xs text-slate-400 mt-1">Podrá configurar los permisos del usuario para esa ubicación específica.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl z-10"></div>
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 ml-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <MdStore size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Sucursales</h4>
                        <p className="text-xs text-slate-400 font-medium">Gestiona las sucursales asignadas al usuario</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col relative w-full h-full">
                <Tabs
                    tabs={items}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>
        </div>
    );
};
