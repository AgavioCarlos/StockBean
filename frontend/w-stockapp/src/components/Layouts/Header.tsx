import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { HiMail } from "react-icons/hi";
import { FiMenu, FiCheck, FiCheckCircle } from "react-icons/fi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useAlerts } from "../../hooks/useAlerts";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../hooks/useAuth";
import { useStyles } from "../../hooks/useStyles";
import { obtenerAlertas, contarAlertas, marcarAlertaLeida, marcarTodasLeidas, type IAlerta } from "../../services/AlertaService";
import ChatRoom from "../../features/Chat/components/ChatRoom";

interface HeaderProps {
    isSidebarOpen?: boolean;
    sidebarCollapsed?: boolean;
    onOpenSidebar?: () => void;
}

function Header({
    isSidebarOpen = false,
    sidebarCollapsed = false,
    onOpenSidebar
}: HeaderProps) {
    const navigate = useNavigate();
    const { isMobile } = useResponsive();
    const { confirm } = useAlerts();
    const { user } = useAuth();
    const { styles } = useStyles();

    // ─── Alertas ────────────────────────────────────────────
    const [alertas, setAlertas] = useState<IAlerta[]>([]);
    const [alertCount, setAlertCount] = useState(0);
    const [showAlertPanel, setShowAlertPanel] = useState(false);
    const [loadingAlertas, setLoadingAlertas] = useState(false);
    const alertPanelRef = useRef<HTMLDivElement>(null);

    // ─── Chat ───────────────────────────────────────────────
    const [showChatPanel, setShowChatPanel] = useState(false);
    const [unreadChatCount, setUnreadChatCount] = useState(0); // Fase 4 Mock de no leídos
    const chatPanelRef = useRef<HTMLDivElement>(null);

    // Cargar el conteo de alertas al montar y cada 30 segundos
    const fetchAlertCount = useCallback(async () => {
        if (!user) return;
        try {
            const count = await contarAlertas();
            setAlertCount(count);
        } catch (err) {
            console.error("Error fetching alert count:", err);
        }
    }, [user]);

    useEffect(() => {
        fetchAlertCount();
        const interval = setInterval(fetchAlertCount, 300000); // cada 5 minutos
        return () => clearInterval(interval);
    }, [fetchAlertCount]);

    // Cerrar panel al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (alertPanelRef.current && !alertPanelRef.current.contains(e.target as Node)) {
                setShowAlertPanel(false);
            }
            if (chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) {
                setShowChatPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Abrir/cerrar panel de alertas
    const toggleAlertPanel = async () => {
        const nextState = !showAlertPanel;
        setShowAlertPanel(nextState);

        if (nextState && alertas.length === 0) {
            setLoadingAlertas(true);
            try {
                const data = await obtenerAlertas();
                setAlertas(data);
            } catch (err) {
                console.error("Error fetching alertas:", err);
            } finally {
                setLoadingAlertas(false);
            }
        }
    };

    // Marcar una alerta como leída
    const handleDismissAlerta = async (idAlerta: number) => {
        try {
            await marcarAlertaLeida(idAlerta);
            setAlertas(prev => prev.filter(a => a.idAlerta !== idAlerta));
            setAlertCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking alert as read:", err);
        }
    };

    // Marcar todas como leídas
    const handleDismissAll = async () => {
        try {
            await marcarTodasLeidas();
            setAlertas([]);
            setAlertCount(0);
        } catch (err) {
            console.error("Error marking all alerts as read:", err);
        }
    };

    // Obtener estilo del ícono de alerta según tipo
    const getAlertStyle = (tipoNombre: string) => {
        const lower = tipoNombre?.toLowerCase() || "";
        if (lower.includes("sin_existencia") || lower.includes("sin existencia")) {
            return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
        }
        if (lower.includes("stock_bajo") || lower.includes("stock bajo")) {
            return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" };
        }
        return { bg: "bg-empresa-primario/10", text: "text-empresa-primario", border: "border-empresa-primario/20" };
    };

    // Tiempo relativo
    const tiempoRelativo = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diffMs = ahora.getTime() - fecha.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "Justo ahora";
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `Hace ${diffHrs}h`;
        const diffDays = Math.floor(diffHrs / 24);
        return `Hace ${diffDays}d`;
    };

    const handleProfile = () => {
        navigate("/perfil");
    };

    const handleLogout = async () => {
        const isConfirmed = await confirm(
            "¿Cerrar sesión?",
            "Tu sesión actual se cerrará",
            "Sí, salir",
            "Cancelar"
        );

        if (isConfirmed) {
            localStorage.removeItem("token");
            localStorage.removeItem("isAuthenticated");
            navigate("/");
        }
    };

    const marginLeft = !isMobile && isSidebarOpen ? (sidebarCollapsed ? 80 : 288) : 0;

    // User display name
    const displayName = user?.nombre
        ? `${user.nombre} ${user.apellido_paterno || ""}`.trim()
        : user?.cuenta || "Usuario";
    const roleName = user?.id_rol === 1 ? "SISTEM" :
        user?.id_rol === 2 ? "ADMIN" :
            user?.id_rol === 3 ? "GERENTE" :
                user?.id_rol === 4 ? "CAJERO" : "Usuario";

    return (
        <header
            style={{
                marginLeft,
                transition: 'margin-left 300ms',
                backgroundColor: 'var(--color-secundario)',
                borderColor: 'rgba(255,255,255,0.05)'
            }}
            className="backdrop-blur-md text-white h-20 px-8 flex justify-between items-center sticky top-0 z-40 border-b shadow-xl shadow-black/20"
        >
            {/* Left Section */}
            <div className="flex items-center gap-6">
                {(!isSidebarOpen || isMobile) && (
                    <button
                        onClick={onOpenSidebar}
                        className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-empresa-primario transition-all duration-300 shadow-lg group active:scale-95"
                        title="Abrir menú"
                    >
                        <FiMenu className="text-xl group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                )}

                {!isMobile && !isSidebarOpen && (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: 'var(--color-primario)' }}
                        >
                            <img src={styles?.urlLogo || "/stock_icono.ico"} alt="Icon" className={`w-6 h-6 ${!styles?.urlLogo ? 'invert' : ''}`} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">BALUARTE</span>
                    </div>
                )}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-indigo-500/50 transition-all">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-gray-500"
                    />
                    <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono">⌘K</kbd>
                </div>

                <div className="flex items-center gap-2 mr-2">
                    {/* Notifications Bell — con alertas reales */}
                    <div ref={alertPanelRef} className="relative">
                        <button
                            onClick={toggleAlertPanel}
                            className={`relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border transition-all group ${showAlertPanel
                                ? "border-indigo-500/50 bg-white/10"
                                : "border-white/5 hover:border-indigo-500/50 hover:bg-white/10"
                                }`}
                            title="Alertas de inventario"
                        >
                            <IoNotifications className={`text-lg transition-colors ${showAlertPanel ? "text-indigo-400" : "text-gray-400 group-hover:text-indigo-400"
                                }`} />
                            {alertCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white px-1">
                                    {alertCount > 99 ? "99+" : alertCount}
                                </span>
                            )}
                        </button>

                        {/* Alert Dropdown Panel */}
                        {showAlertPanel && (
                            <div className="fixed sm:absolute top-20 sm:top-full right-4 sm:right-0 left-4 sm:left-auto mt-2 sm:w-96 bg-gray-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100] sm:z-50 max-h-[80vh] flex flex-col">
                                {/* Panel header */}
                                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Alertas de Inventario</h3>
                                        <span className="text-xs text-gray-500">{alertCount} {alertCount === 1 ? "alerta activa" : "alertas activas"}</span>
                                    </div>
                                    {alertas.length > 0 && (
                                        <button
                                            onClick={handleDismissAll}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <FiCheckCircle size={12} />
                                            Leer todas
                                        </button>
                                    )}
                                </div>

                                {/* Alert list */}
                                <div className="max-h-80 overflow-y-auto">
                                    {loadingAlertas && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}

                                    {!loadingAlertas && alertas.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                            <FiCheckCircle size={28} className="mb-2 opacity-40" />
                                            <span className="text-sm font-medium">Sin alertas pendientes</span>
                                            <span className="text-xs text-gray-600 mt-1">Todo el inventario está en orden</span>
                                        </div>
                                    )}

                                    {!loadingAlertas && alertas.map((alerta) => {
                                        const style = getAlertStyle(alerta.tipoAlerta?.nombre || "");
                                        return (
                                            <div
                                                key={alerta.idAlerta}
                                                className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div className={`w-9 h-9 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                        <HiOutlineExclamationTriangle className={style.text} size={16} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-200 leading-snug">{alerta.mensaje}</p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                                {alerta.sucursal?.nombre || "Sucursal"}
                                                            </span>
                                                            <span className="text-gray-700">•</span>
                                                            <span className="text-[10px] text-gray-600">
                                                                {tiempoRelativo(alerta.fecha)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Dismiss */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDismissAlerta(alerta.idAlerta);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex-shrink-0"
                                                        title="Marcar como leída"
                                                    >
                                                        <FiCheck size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div ref={chatPanelRef} className="relative">
                        <button
                            onClick={() => setShowChatPanel(!showChatPanel)}
                            className={`relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border transition-all group ${showChatPanel
                                ? "border-indigo-500/50 bg-white/10"
                                : "border-white/5 hover:border-indigo-500/50 hover:bg-white/10"
                                }`}
                            title="Mensajes"
                        >
                            <HiMail className={`text-lg transition-colors ${showChatPanel ? "text-indigo-400" : "text-gray-400 group-hover:text-indigo-400"}`} />
                            {unreadChatCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-indigo-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white px-1">
                                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                                </span>
                            )}
                        </button>

                        {/* Chat Dropdown Panel */}
                        {showChatPanel && (
                            <div className="fixed sm:absolute top-20 sm:top-full right-4 sm:right-0 left-4 sm:left-auto mt-2 sm:w-[350px] h-[75vh] sm:h-[500px] bg-gray-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100] sm:z-50 flex flex-col">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                    <div>
                                        <h3 className="font-bold text-white text-sm m-0 flex items-center gap-2">
                                            Chat
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowChatPanel(false)}
                                        className="text-gray-400 hover:text-white transition-colors text-lg focus:outline-none"
                                        aria-label="Cerrar ventana de chat"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Contenedor principal del Room */}
                                <div className="flex-1 overflow-hidden">
                                    <ChatRoom />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

                {/* User Profile */}
                <button
                    onClick={handleProfile}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <FaUserCircle className="text-2xl text-white/90" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                        <span className="text-sm font-bold text-gray-100 group-hover:text-indigo-400 transition-colors">{displayName}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{roleName}</span>
                    </div>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 border border-red-500/20 active:scale-95 ml-2"
                    title="Cerrar sesión"
                >
                    <RiLogoutCircleLine className="text-lg" />
                </button>
            </div>
        </header>
    );
}

export default Header;
