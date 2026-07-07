import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./LoginService";
import { getPantallasUsuario, savePantallasToLocalStorage } from "../../services/Pantallas";
import { useAlerts } from "../../hooks/useAlerts";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCog, FaDatabase, FaBuilding, FaChevronDown } from 'react-icons/fa';
import PaymentModal from "../../components/PaymentModal";
import { DatabaseConfigModal } from "./components/DatabaseConfigModal";
import { apiFetch } from "../../services/Api";
import { Sucursales } from "../../services/Lovs";

function Login() {
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sucursal, setSucursal] = useState("");
  const [sucursales, setSucursales] = useState<any[]>([]);
  const { error: showError } = useAlerts();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    apiFetch<any>('/system/info')
      .then(setSystemInfo)
      .catch(err => console.error("Error al cargar info de sistema:", err));

    Sucursales()
      .then(data => {
        setSucursales(data || []);
        if (data && data.length > 0) {
          const firstId = data[0].id_sucursal || data[0].idSucursal;
          setSucursal(firstId.toString());
        }
      })
      .catch(err => console.error("Error al cargar sucursales:", err));
  }, []);

  const waitForBackend = async () => {
    setLoadingMessage("Conectando al servidor...");
    const poll = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/health`);
        if (res.ok) {
          setLoadingMessage("Sistema listo");
          setTimeout(() => window.location.reload(), 1000);
          return;
        }
      } catch (e) {
      }
      setTimeout(poll, 2000);
    };
    poll();
  };

  const handleConfigSaveSuccess = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user_data");
    localStorage.removeItem("pantallas");

    setIsConfigModalOpen(false);
    setIsRestarting(true);
    setLoadingMessage("Reiniciando servicio...");
    setTimeout(waitForBackend, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await login({ sucursal, cuenta, password });

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user_data", JSON.stringify(data));
        localStorage.setItem("id_sucursal", sucursal);

        console.log("Sucursal", sucursal);

        try {
          const pantallas = await getPantallasUsuario(sucursal);
          savePantallasToLocalStorage(pantallas);
        } catch (pantallasError) {
          console.error("⚠️ Error al cargar pantallas:", pantallasError);
        }

        // if (data.empresa && data.empresa.length > 0) {
        //   localStorage.removeItem("requiresEmpresaConfig");
        //   const emp = data.empresa[0] as any;
        //   const idEmp = emp.idEmpresa || emp.id_empresa;
        //   localStorage.setItem("id_empresa", idEmp?.toString() || "");
        // } else if (data.cuenta === "sistemas") {
        //   localStorage.setItem("requiresEmpresaConfig", "false");
        // } else {
        //   localStorage.setItem("requiresEmpresaConfig", "true");
        // }
        window.location.href = "/home";
      }
    } catch (err: any) {
      if (err.message === "Suscripción vencida") {
        setPaymentMessage("Tu suscripción ha expirado. Por favor, renueva tu plan realizando el pago correspondiente para continuar.");
        setIsPaymentModalOpen(true);
      } else if (err.message === "Suscripción inactiva") {
        setPaymentMessage("Tu suscripción se encuentra inactiva o pendiente de validación. Realiza el pago para continuar.");
        setIsPaymentModalOpen(true);
      } else if (err.message === "No tienes una suscripción activa") {
        setPaymentMessage("No se encontró una suscripción activa para esta cuenta. Adquiere un plan para poder iniciar sesión.");
        setIsPaymentModalOpen(true);
      } else {
        showError("Error de Acceso", err.message || "Credenciales inválidas o error de conexión");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-200/30 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {isRestarting && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaDatabase className="text-indigo-600 animate-pulse" size={24} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight uppercase italic underline decoration-indigo-500 underline-offset-8">
            {loadingMessage}
          </h2>
          <p className="text-slate-500 font-bold max-w-sm text-sm">
            Estamos reconfigurando el núcleo del sistema…
          </p>
        </div>
      )}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="w-11 h-11 bg-white/40 backdrop-blur-xl text-slate-400 rounded-2xl shadow-sm border border-white/50 flex items-center justify-center hover:text-indigo-600 hover:bg-white hover:rotate-90 transition-all duration-500 group focus-visible:ring-4 focus-visible:ring-indigo-200 outline-none"
          title="Configuración de Red"
        >
          <FaCog size={20} className="group-hover:drop-shadow-sm" />
        </button>
      </div>

      <div className="w-full max-w-[410px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center mb-6 space-y-4">
          <div className="relative group">
            <button
              onClick={() => navigate('/')}
              className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-[2.2rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transform transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              title="Ir al Inicio"
            >
              <img src="/stock_icono.ico" alt="StockApp Icon" className="w-12 h-12 invert animate-in zoom-in-50 duration-700" />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1.5 flex items-center justify-center gap-1">
              Baluarte
            </h1>
            {systemInfo && (
              <div className="mt-1 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white shadow-sm hover:shadow-md hover:bg-white transition-all cursor-default">
                  <div className="relative flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${systemInfo.mode === 'LOCAL' ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
                    {systemInfo.mode === 'LOCAL' && <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>}
                  </div>
                  <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{systemInfo.mode} INSTANCE</span>
                    <span className="text-xs font-black text-slate-700 tracking-tight">
                      {systemInfo.company}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border border-white p-8 sm:p-10 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-indigo-600 to-indigo-400"></div>

          <div className="mb-7 relative">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Acceso al Sistema</h2>
            <div className="h-1 w-10 bg-indigo-600 rounded-full mt-2.5"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-indigo-600" htmlFor="idSucursal">Sucursal</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaBuilding size={14} />
                  </div>
                  <select
                    id="idSucursal"
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-50/50 border-2 border-slate-100/50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/[0.03] outline-none transition-all duration-300 font-bold text-slate-700 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Seleccione Sucursal</option>
                    {sucursales.map(suc => (
                      <option key={suc.id_sucursal || suc.idSucursal} value={suc.id_sucursal || suc.idSucursal}>
                        {suc.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                    <FaChevronDown size={10} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-indigo-600" htmlFor="cuenta">Cuenta de Usuario</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaUser size={14} />
                  </div>
                  <input
                    type="text"
                    id="cuenta"
                    name="username"
                    autoComplete="username"
                    placeholder="Usuario"
                    value={cuenta}
                    onChange={(e) => setCuenta(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-100/50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/[0.03] outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                    required
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-indigo-600" htmlFor="password">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaLock size={14} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border-2 border-slate-100/50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/[0.03] outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none focus-visible:scale-110 active:scale-90"
                    aria-label={showPassword ? "Ocultar Contraseña" : "Ver Contraseña"}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative group/btn ${isSubmitting
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-slate-900 active:scale-[0.97]'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span className="tracking-tight uppercase text-sm">Autenticando…</span>
                </div>
              ) : (
                <>
                  <span className="tracking-tight uppercase text-sm">Entrar</span>
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        <p className="text-center mt-7 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] opacity-50 select-none">
          Baluarte ERP Professional Edition © 2024
        </p>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        message={paymentMessage}
      />

      <DatabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaveSuccess={handleConfigSaveSuccess}
      />
    </div>
  );
}

export default Login;
