import { useEffect, useState } from "react";
import MainLayout from "../../components/Layouts/MainLayout";
import {
    FaUserCircle,
    FaIdCard,
    FaEdit,
    FaShieldAlt,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaEnvelope,
    FaUserTag,
    FaChartBar
} from "react-icons/fa";
import { consultarPersona } from "../Persona/PersonaService";
import Breadcrumb from "../../components/Breadcrumb";
import EditProfileModal from "../../components/EditProfileModal";
import { obtenerVentasPorDia } from "../Reportes/ReporteVentasService";
import type { IVentasPorDia } from "../Reportes/reporte_ventas.interface";

interface Persona {
    id_persona: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    email: string;
    status: boolean;
    // New fields from login
    id_rol?: number;
    cuenta?: string;
    fecha_alta?: string;
}

function Perfil() {
    const [persona, setPersona] = useState<Persona | null>(null);
    const [ventasDia, setVentasDia] = useState<IVentasPorDia[]>([]);
    const [loadingPersona, setLoadingPersona] = useState(true);
    const [loadingVentas, setLoadingVentas] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const cargarDatos = async () => {
        try {
            // First try to get data from local storage (Login response)
            const storedData = localStorage.getItem("user_data");
            if (storedData) {
                const userData = JSON.parse(storedData);
                // Map LoginResponse to Persona interface expected by the component
                setPersona({
                    id_persona: userData.id_persona || 0,
                    nombre: userData.nombre || "",
                    apellido_paterno: userData.apellido_paterno || "",
                    apellido_materno: userData.apellido_materno || "",
                    email: userData.email || "",
                    status: userData.status || false,
                    id_rol: userData.id_rol,
                    cuenta: userData.cuenta,
                    fecha_alta: userData.fecha_alta
                });
                setLoadingPersona(false);
            } else {
                // Fallback to API if no local data
                const dataPersona = await consultarPersona();
                setPersona({
                    ...dataPersona,
                    id_persona: dataPersona.id_persona ?? 0
                });
                setLoadingPersona(false);
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            setLoadingPersona(false);
        }

        try {
            // Cargar estadística de ventas por día
            const dataVentas = await obtenerVentasPorDia();
            setVentasDia(dataVentas);
        } catch (error) {
            console.error("Error al consultar ventas por día:", error);
        } finally {
            setLoadingVentas(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleProfileUpdate = (updatedPersona: any) => {
        setPersona(prev => prev ? { ...prev, ...updatedPersona } : updatedPersona);
        // Also refresh from storage since modal updates it
        cargarDatos();
    };

    const getRoleName = (id?: number) => {
        switch (id) {
            case 1: return "Administrador del Sistema";
            case 2: return "Gerente de Sucursal";
            case 3: return "Cajero / Operativo";
            case 4: return "Soporte Técnico";
            default: return `Rol Personalizado (${id})`;
        }
    };

    if (loadingPersona) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Cargando perfil…</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", onClick: () => { window.history.back() } },
                        { label: persona ? `${persona.nombre} ${persona.apellido_paterno}` : "Perfil de Usuario" }
                    ]}
                    onBack={() => window.history.back()}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50">
                            {/* Decorative Background */}
                            <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                                    {persona?.status ? "Verificado" : "Pendiente"}
                                </div>
                            </div>

                            <div className="px-6 pb-8 flex flex-col items-center -mt-16 relative">
                                <div className="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-2xl relative">
                                    <div className="w-full h-full bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-blue-600 overflow-hidden transition-transform duration-500 group-hover:scale-95">
                                        <FaUserCircle size={80} />
                                    </div>
                                    {persona?.status && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white rounded-full p-1.5 text-white shadow-lg">
                                            <FaCheckCircle size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 text-center space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {persona ? `${persona.nombre} ${persona.apellido_paterno}` : "Usuario del Sistema"}
                                    </h2>
                                    <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
                                        <FaEnvelope className="text-gray-400" /> {persona?.email || "correo@ejemplo.com"}
                                    </p>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/50 hover:bg-blue-50/50 transition-colors cursor-default group/item">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 group-hover/item:text-blue-400">Rol</p>
                                        <p className="text-sm font-bold text-gray-800 tracking-tight">{persona?.id_rol === 1 ? "Admin" : "Usuario"}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/50 hover:bg-green-50/50 transition-colors cursor-default group/item">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 group-hover/item:text-green-400">Estado</p>
                                        <p className="text-sm font-bold text-gray-800 tracking-tight flex items-center justify-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${persona?.status ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                                            {persona?.status ? "Activo" : "Inactivo"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-gray-200 flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-blue-200 transition-all duration-300 transform active:scale-[0.98] group"
                                >
                                    <FaEdit className="transition-transform group-hover:rotate-12" />
                                    Editar Información
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats / Info */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Acceso y Seguridad</h4>
                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Seguridad</p>
                                    <p className="text-xs text-gray-500 text-pretty leading-tight">Doble factor activado</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Miembro desde</p>
                                    <p className="text-xs text-gray-500 tabular-nums">
                                        {persona?.fecha_alta ? new Date(persona.fecha_alta).toLocaleDateString() : "Enero 2024"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info & Reports */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        {/* Information Section */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8 md:p-10 relative overflow-hidden">
                            {/* Accent Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                            <FaIdCard />
                                        </div>
                                        Información Detallada
                                    </h3>
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                                        Perfil ID: {persona?.id_persona.toString().padStart(4, '0')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    <InfoField
                                        label="Nombre Completo"
                                        value={`${persona?.nombre} ${persona?.apellido_paterno} ${persona?.apellido_materno || ""}`}
                                        icon={<FaUserTag />}
                                    />
                                    <InfoField
                                        label="Correo Electrónico"
                                        value={persona?.email || ""}
                                        icon={<FaEnvelope />}
                                    />
                                    <InfoField
                                        label="Cuenta de Usuario"
                                        value={persona?.cuenta || "N/A"}
                                        icon={<FaIdCard />}
                                    />
                                    <InfoField
                                        label="Rol del Sistema"
                                        value={getRoleName(persona?.id_rol)}
                                        icon={<FaShieldAlt />}
                                    />
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Estatus</p>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl w-fit">
                                            {persona?.status ? (
                                                <><FaCheckCircle className="text-green-500" /> <span className="text-sm font-bold text-gray-800">Activo</span></>
                                            ) : (
                                                <><FaTimesCircle className="text-red-500" /> <span className="text-sm font-bold text-gray-800">Inactivo</span></>
                                            )}
                                        </div>
                                    </div>
                                    <InfoField
                                        label="Fecha de Registro"
                                        value={persona?.fecha_alta ? new Date(persona.fecha_alta).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : "No registrada"}
                                        icon={<FaCalendarAlt />}
                                        tabular
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Products / Reports Section */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                            <div className="p-8 md:p-10 border-b border-gray-50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                        <FaChartBar className="text-blue-500" /> Rendimiento de Ventas por Día
                                    </h3>
                                    <p className="text-sm text-gray-500">Historial de volumen y producto más vendido</p>
                                </div>
                            </div>

                            <div className="p-4 md:p-8">
                                {loadingVentas ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                                        <p className="font-medium">Consultando historial de ventas…</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                                        <table className="w-full text-left text-sm text-gray-600">
                                            <thead className="bg-gray-50/80 text-gray-800 font-bold border-b border-gray-100 uppercase tracking-wider text-[11px]">
                                                <tr>
                                                    <th className="px-6 py-4">Fecha</th>
                                                    <th className="px-6 py-4">Producto Top</th>
                                                    <th className="px-6 py-4 text-center">Unidades</th>
                                                    <th className="px-6 py-4 text-right">Total Ventas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {ventasDia.map((item, index) => (
                                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                                            {new Date(item.fecha + "T00:00:00").toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-700">
                                                            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 group-hover:bg-purple-100 transition-colors">
                                                                {item.topProducto}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold font-variant-numeric: tabular-nums">
                                                            {item.cantidad}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-emerald-600 font-variant-numeric: tabular-nums">
                                                            ${item.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {!loadingVentas && ventasDia.length === 0 && (
                                <div className="pb-10 pt-4 text-center">
                                    <p className="text-gray-400 text-sm">No hay registros de ventas en los últimos 30 días.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                persona={persona}
                onUpdate={handleProfileUpdate}
            />
        </MainLayout>
    );
}

interface InfoFieldProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
    tabular?: boolean;
}

function InfoField({ label, value, icon, tabular }: InfoFieldProps) {
    return (
        <div className="space-y-2 group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 group-hover:text-blue-500 transition-colors">
                {label}
            </p>
            <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-blue-100 group-hover:shadow-md transition-all duration-300">
                {icon && <div className="text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</div>}
                <p className={`text-sm text-gray-800 font-bold tracking-tight ${tabular ? 'font-variant-numeric: tabular-nums' : ''}`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

export default Perfil;
