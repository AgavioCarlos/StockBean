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
    FaChartBar,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSave
} from "react-icons/fa";
import { consultarPersona, actualizarPersona } from "../Persona/PersonaService";
import Breadcrumb from "../../components/Breadcrumb";
import { obtenerVentasPorDia } from "../Reportes/ReporteVentasService";
import type { IVentasPorDia } from "../Reportes/reporte_ventas.interface";
import Swal from "sweetalert2";

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
    password?: string;
}

function Perfil() {
    const [persona, setPersona] = useState<Persona | null>(null);
    const [ventasDia, setVentasDia] = useState<IVentasPorDia[]>([]);
    const [loadingPersona, setLoadingPersona] = useState(true);
    const [loadingVentas, setLoadingVentas] = useState(true);
    
    // States for inline editing
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const startEditing = () => {
        if (persona) {
            setFormData({
                nombre: persona.nombre || '',
                apellido_paterno: persona.apellido_paterno || '',
                apellido_materno: persona.apellido_materno || '',
                email: persona.email || '',
                password: ''
            });
            setErrors({});
            setShowPassword(false);
            setIsEditing(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'El apellido paterno es requerido';
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(formData.email)) {
                newErrors.email = 'Email inválido';
            }
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !persona) return;
        setIsSaving(true);
        try {
            const updatedData = {
                ...persona,
                ...formData
            };
            const response = await actualizarPersona(persona.id_persona, updatedData);
            if (response) {
                // Update local storage
                const storedData = localStorage.getItem("user_data");
                if (storedData) {
                    const userData = JSON.parse(storedData);
                    const localDataToSave = { ...formData };
                    delete localDataToSave.password; // Do not store plain password
                    const newUserContext = { ...userData, ...localDataToSave };
                    localStorage.setItem("user_data", JSON.stringify(newUserContext));
                }

                await Swal.fire({
                    icon: 'success',
                    title: '¡Perfil Actualizado!',
                    text: 'Tus cambios se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                setPersona(prev => prev ? { ...prev, ...formData } : null);
                setIsEditing(false);
            }
        } catch (error: any) {
            console.error('Error al actualizar perfil:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar el perfil.',
                confirmButtonText: 'Cerrar'
            });
        } finally {
            setIsSaving(false);
        }
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

                                {!isEditing ? (
                                    <button
                                        onClick={startEditing}
                                        className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-gray-200 flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-blue-200 transition-all duration-300 transform active:scale-[0.98] group"
                                    >
                                        <FaEdit className="transition-transform group-hover:rotate-12" />
                                        Editar Información
                                    </button>
                                ) : (
                                    <div className="mt-8 space-y-3 w-full animate-in fade-in duration-300">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-blue-300 transition-all duration-300 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Guardando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave />
                                                    <span>Guardar Cambios</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
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
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nombre</p>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.nombre ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                                />
                                                {errors.nombre && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.nombre}</p>}
                                            </div>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Apellido Paterno</p>
                                                <input
                                                    type="text"
                                                    name="apellido_paterno"
                                                    value={formData.apellido_paterno}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.apellido_paterno ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                                />
                                                {errors.apellido_paterno && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.apellido_paterno}</p>}
                                            </div>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Apellido Materno</p>
                                                <input
                                                    type="text"
                                                    name="apellido_materno"
                                                    value={formData.apellido_materno}
                                                    onChange={handleInputChange}
                                                    placeholder="Opcional"
                                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                                                />
                                            </div>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Correo Electrónico</p>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                                />
                                                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                                            </div>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nueva Contraseña (dejar en blanco para no cambiar)</p>
                                                <div className="relative group">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Min. 6 caracteres"
                                                        className={`w-full pl-4 pr-12 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => !prev)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
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
                                                label="Contraseña"
                                                value="••••••••"
                                                icon={<FaLock />}
                                            />
                                        </>
                                    )}
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
