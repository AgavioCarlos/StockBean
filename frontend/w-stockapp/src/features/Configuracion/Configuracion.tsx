import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { useState, useEffect, useMemo } from "react";
import { useStyles } from "../../hooks/useStyles";
import { saveDisenoEmpresa, EmpresaDiseno, uploadLogoEmpresa } from "../../services/EmpresaDisenoService";
import { useAlertContext } from "../../context/AlertContext";
import { FiRefreshCw, FiImage, FiType, FiDroplet, FiBox } from "react-icons/fi";
import Swal from "sweetalert2";

const PRESET_PALETTES = [
    { name: 'Corporativo', primary: '#3b82f6', secondary: '#0F172A', accent: '#f59e0b', fondo: '#f8fafc' },
    { name: 'Esmeralda', primary: '#10b981', secondary: '#064e3b', accent: '#10b981', fondo: '#f0fdf4' },
    { name: 'Océano', primary: '#0ea5e9', secondary: '#0c4a6e', accent: '#38bdf8', fondo: '#f0f9ff' },
    { name: 'Púrpura', primary: '#8b5cf6', secondary: '#4c1d95', accent: '#d946ef', fondo: '#f5f3ff' },
    { name: 'Noche', primary: '#6366f1', secondary: '#18181b', accent: '#ffffff', fondo: '#fafafa' },
];

function Configuracion() {
    const { styles: disenoActual, recargarEstilos } = useStyles();
    const { addToast } = useAlertContext();
    const [vista, setVista] = useState("database");
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formDiseno, setFormDiseno] = useState<EmpresaDiseno>({
        colorPrimario: "#3b82f6",
        colorSecundario: "#1e293b",
        colorAcento: "#f59e0b",
        colorFondo: "#f8fafc",
        fuenteFamilia: "Instrument Sans, sans-serif",
        estiloBoton: "rounded-md",
        redondeoComponentes: "0.375rem",
        temaOscuroHabilitado: false
    });

    useEffect(() => {
        if (disenoActual) setFormDiseno(disenoActual);
    }, [disenoActual]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormDiseno(prev => ({ ...prev, [name]: value }));
    };

    const aplicarPaleta = (p: typeof PRESET_PALETTES[0]) => {
        setFormDiseno(prev => ({
            ...prev,
            colorPrimario: p.primary,
            colorSecundario: p.secondary,
            colorAcento: p.accent,
            colorFondo: p.fondo
        }));
    };

    const handleSaveStyles = async () => {
        const idEmpresa = localStorage.getItem("id_empresa");
        if (!idEmpresa) {
            addToast("Error", "error", "No se encontró ID de empresa");
            return;
        }
        try {
            setLoading(true);

            let uploadedLogoName = formDiseno.urlLogo;
            if (logoFile) {
                const newLogoName = await uploadLogoEmpresa(parseInt(idEmpresa), logoFile);
                if (newLogoName) {
                    uploadedLogoName = newLogoName;
                }
            } else if (uploadedLogoName && uploadedLogoName.startsWith('/src/assets/logos/')) {
                // Si la imagen viene del estado mutado desde backend, le quitamos la ruta absoluta antes de guardarla de vuelta
                uploadedLogoName = uploadedLogoName.split('/').pop() || uploadedLogoName;
            }

            await saveDisenoEmpresa({
                ...formDiseno,
                urlLogo: uploadedLogoName,
                idEmpresa: parseInt(idEmpresa),
                idDiseno: disenoActual?.idDiseno
            });

            recargarEstilos();

            // Swal.fire({
            //     title: 'Estilos Actualizados',
            //     text: 'Para asegurar que los estilos corporativos se apliquen correctamente a todas las vistas del sistema, su sesión se cerrará a continuación. Por favor, vuelva a ingresar.',
            //     icon: 'success',
            //     confirmButtonText: 'Cerrar Sesión y Aplicar',
            //     confirmButtonColor: formDiseno.colorPrimario || '#3b82f6',
            //     allowOutsideClick: false,
            //     allowEscapeKey: false
            // }).then(() => {
            //     localStorage.removeItem("token");
            //     localStorage.removeItem("isAuthenticated");
            //     localStorage.removeItem("user_data");
            //     localStorage.removeItem("pantallas");
            //     localStorage.removeItem("id_empresa");
            //     window.location.href = "/login";
            // });

        } catch (error) {
            addToast("Error", "error", "No se pudieron guardar los cambios");
        } finally {
            setLoading(false);
        }
    };

    const pestañas = useMemo(() => [
        { key: "database", label: "Base de Datos" },
        { key: "estilos", label: "Personalización" },
    ], []);

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configuración del Sistema</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Gestiona los parámetros técnicos y la identidad visual de tu empresa.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 overflow-hidden">
                    <div className="px-8 pt-8 border-b border-gray-50 bg-gray-50/30">
                        <Tabs tabs={pestañas} activeTab={vista} onChange={setVista} />
                    </div>

                    <div className="p-8">
                        {vista === "database" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500 max-w-4xl">
                                <ConfigInput label="Base de datos" placeholder="stockbean_db" />
                                <ConfigInput label="Puerto" placeholder="5432" />
                                <ConfigInput label="Host" placeholder="localhost" />
                                <ConfigInput label="Contraseña Master" placeholder="••••••••" type="password" />
                            </div>
                        )}

                        {vista === "estilos" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                    {/* Configuración Lado Izquierdo */}
                                    <div className="lg:col-span-8 space-y-10">

                                        {/* Presets Rápidos */}
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Paletas Sugeridas</label>
                                            <div className="flex flex-wrap gap-3">
                                                {PRESET_PALETTES.map((p) => (
                                                    <button
                                                        key={p.name}
                                                        onClick={() => aplicarPaleta(p)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="flex -space-x-1">
                                                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.primary }}></div>
                                                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.secondary }}></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{p.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selectores de Color */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FiDroplet /></div>
                                                <h3 className="text-lg font-bold text-gray-900">Paleta de Colores</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <ColorItem label="Color Primario" name="colorPrimario" value={formDiseno.colorPrimario} onChange={handleInputChange} />
                                                <ColorItem label="Color Secundario" name="colorSecundario" value={formDiseno.colorSecundario} onChange={handleInputChange} />
                                                <ColorItem label="Color Acento" name="colorAcento" value={formDiseno.colorAcento} onChange={handleInputChange} />
                                                <ColorItem label="Color de Fondo" name="colorFondo" value={formDiseno.colorFondo} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        {/* Identidad y Bordes */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Section headerIcon={<FiType />} headerBg="bg-green-50" headerText="text-green-600" title="Estética">
                                                <div className="space-y-4">
                                                    <SelectItem label="Fuente" name="fuenteFamilia" value={formDiseno.fuenteFamilia} onChange={handleInputChange}>
                                                        <option value="'Instrument Sans', sans-serif">Instrument Sans</option>
                                                        <option value="'Outfit', sans-serif">Outfit</option>
                                                        <option value="'Inter', sans-serif">Inter</option>
                                                        <option value="system-ui, sans-serif">Sistema</option>
                                                    </SelectItem>
                                                    <SelectItem label="Redondeo" name="redondeoComponentes" value={formDiseno.redondeoComponentes} onChange={handleInputChange}>
                                                        <option value="0rem">Plano (0px)</option>
                                                        <option value="0.375rem">Suave (6px)</option>
                                                        <option value="0.75rem">Redondo (12px)</option>
                                                        <option value="1.25rem">Círculo (20px)</option>
                                                    </SelectItem>
                                                </div>
                                            </Section>
                                            <Section headerIcon={<FiImage />} headerBg="bg-amber-50" headerText="text-amber-600" title="Identidad">
                                                <div className="space-y-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Logo de Empresa</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-inner overflow-hidden border border-gray-200 bg-gray-50">
                                                                {(logoPreview || formDiseno.urlLogo) ? (
                                                                    <img
                                                                        src={logoPreview || formDiseno.urlLogo}
                                                                        alt="Logo"
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <FiImage className="text-gray-300 text-2xl" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            const file = e.target.files[0];
                                                                            setLogoFile(file);
                                                                            setLogoPreview(URL.createObjectURL(file));
                                                                        }
                                                                    }}
                                                                    className="block w-full text-sm text-gray-500
                                                                    file:mr-4 file:py-2.5 file:px-5 
                                                                    file:rounded-xl file:border-0 
                                                                    file:text-sm file:font-bold file:tracking-wide
                                                                    file:bg-indigo-50 file:text-indigo-600 
                                                                    hover:file:bg-indigo-100 transition-colors file:cursor-pointer pb-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* <InputItem label="URL Favicon" name="urlFavicon" value={formDiseno.urlFavicon || ''} onChange={handleInputChange} placeholder="https://..." /> */}
                                                </div>
                                            </Section>
                                        </div>
                                    </div>

                                    {/* Vista Previa Lado Derecho */}
                                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                                        <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Vista Previa</h4>
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Mini Sidebar/Header Mockup */}
                                                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex" style={{ backgroundColor: formDiseno.colorFondo }}>
                                                    <div className="w-1/4 h-full" style={{ backgroundColor: formDiseno.colorSecundario }}>
                                                        <div className="p-2 space-y-2">
                                                            <div className="w-full h-4 rounded-lg mix-blend-overlay bg-white/20"></div>
                                                            <div className="w-full h-8 rounded-lg" style={{ backgroundColor: formDiseno.colorPrimario }}></div>
                                                            <div className="w-2/3 h-3 rounded-lg mix-blend-overlay bg-white/10"></div>
                                                            <div className="w-3/4 h-3 rounded-lg mix-blend-overlay bg-white/10"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 p-3">
                                                        <div className="w-full h-4 bg-white border border-gray-100 rounded-lg mb-4" style={{ backgroundColor: formDiseno.colorSecundario, opacity: 0.05 }}></div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="h-10 rounded-xl" style={{ backgroundColor: formDiseno.colorPrimario, borderRadius: formDiseno.redondeoComponentes }}></div>
                                                            <div className="h-10 rounded-xl bg-white border border-gray-200" style={{ borderRadius: formDiseno.redondeoComponentes }}></div>
                                                            <div className="h-10 rounded-xl bg-gray-100" style={{ borderRadius: formDiseno.redondeoComponentes }}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: formDiseno.colorPrimario }}>
                                                            <FiBox size={14} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="h-3 w-24 bg-gray-200 rounded-full mb-1"></div>
                                                            <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                                                        </div>
                                                        <div className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ color: formDiseno.colorPrimario, backgroundColor: `${formDiseno.colorPrimario}10` }}>ACTIVO</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSaveStyles}
                                                    disabled={loading}
                                                    className="w-full py-4 rounded-2xl text-white font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                    style={{ backgroundColor: formDiseno.colorPrimario, borderRadius: formDiseno.redondeoComponentes }}
                                                >
                                                    {loading ? 'Guardando...' : 'Aplicar Personalización'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones Globales */}
                                <div className="pt-8 flex justify-end gap-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setFormDiseno(disenoActual || formDiseno)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                        Descartar cambios
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

const ColorItem = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: any }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all group">
        <div className="relative w-12 h-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden shrink-0">
            <input
                type="color"
                name={name}
                value={value}
                onChange={onChange}
                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
            />
        </div>
        <div className="flex-1 min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-sm font-mono font-bold text-gray-700 focus:outline-none uppercase"
            />
        </div>
    </div>
);

const ConfigInput = ({ label, placeholder, type = "text" }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" type={type} placeholder={placeholder} />
    </div>
);

const InputItem = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" {...props} />
    </div>
);

const SelectItem = ({ label, children, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none" {...props}>
            {children}
        </select>
    </div>
);

const Section = ({ headerIcon, headerBg, headerText, title, children }: any) => (
    <div>
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${headerBg} ${headerText} rounded-xl`}>{headerIcon}</div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

export default Configuracion;
