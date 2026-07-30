import { useState, useEffect } from 'react';
import MainLayout from "../components/Layouts/MainLayout";
import Footer from "../components/Layouts/Footer";
import ConfiguracionEmpresa from '../components/ConfiguracionEmpresa';
import { FiTrendingUp, FiBox, FiUsers, FiDollarSign, FiArrowRight, FiActivity } from 'react-icons/fi';
import { obtenerReporteVentas, obtenerStatsDashboard } from '../features/Reportes/ReporteVentasService';
import type { VentaReporte, IDashboardStats } from '../features/Reportes/reporte_ventas.interface';
import { consultarClientes } from '../services/Clientes';

import VentasBarChart from '../features/Reportes/components/VentasBarChart';

function Home() {
  const [showConfiguracionEmpresa, setShowConfiguracionEmpresa] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [reporteData, setReporteData] = useState<VentaReporte[]>([]);
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loadingVentas, setLoadingVentas] = useState(true);

  useEffect(() => {
    // Verificar si el usuario necesita configurar empresa
    const requiresConfig = localStorage.getItem('requiresEmpresaConfig');
    if (requiresConfig === 'true') {
      setShowConfiguracionEmpresa(true);
    }

    // Cargar datos del usuario
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    // Cargar reporte de ventas para la gráfica
    setLoadingVentas(true);
    obtenerReporteVentas()
      .then(setReporteData)
      .catch(err => console.error("Error al cargar ventas en Home:", err))
      .finally(() => setLoadingVentas(false));

    // Cargar estadísticas del Dashboard desde el Backend
    obtenerStatsDashboard()
      .then(setDashboardStats)
      .catch(err => console.error("Error al cargar estadísticas en Home:", err));

    // Cargar total de clientes
    consultarClientes()
      .then(res => {
        if (Array.isArray(res)) setTotalClientes(res.length);
      })
      .catch(err => console.error("Error al cargar clientes en Home:", err));
  }, []);

  const stats = [
    {
      label: 'Monto Ventas',
      value: dashboardStats ? `$${dashboardStats.montoHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00',
      icon: <FiDollarSign />,
      color: 'bg-emerald-500',
      trend: dashboardStats?.trendMonto || '0%',
      trendColor: dashboardStats?.montoColor || 'text-slate-400 bg-slate-50'
    },
    {
      label: 'Total Ventas',
      value: dashboardStats ? dashboardStats.conteoHoy.toString() : '0',
      icon: <FiTrendingUp />,
      color: 'bg-indigo-500',
      trend: dashboardStats?.trendConteo || '0%',
      trendColor: dashboardStats?.conteoColor || 'text-slate-400 bg-slate-50'
    },
    {
      label: 'Productos Vendidos',
      value: dashboardStats ? dashboardStats.unidadesHoy.toString() : '0',
      icon: <FiBox />,
      color: 'bg-blue-500',
      trend: dashboardStats?.trendUnidades || '0%',
      trendColor: dashboardStats?.unidadesColor || 'text-slate-400 bg-slate-50'
    },
    {
      label: 'Promedio/Venta',
      value: dashboardStats ? `$${dashboardStats.promedioHoy.toLocaleString('es-MX', { maximumFractionDigits: 0 })}` : '$0',
      icon: <FiActivity />,
      color: 'bg-purple-500',
      trend: dashboardStats?.trendPromedio || '0%',
      trendColor: dashboardStats?.promedioColor || 'text-slate-400 bg-slate-50'
    },
  ];

  return (
    <>
      {showConfiguracionEmpresa ? (
        <ConfiguracionEmpresa />
      ) : (
        <MainLayout>
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Welcome Hero Card */}
            <div className="relative overflow-hidden bg-[#0F172A] rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl shadow-gray-200">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                  Panel de Control v2.4
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                  ¡Bienvenidx, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">{userData?.nombre || 'Usuario'}</span>!
                </h1>
                <p className="text-lg text-gray-400 font-medium mb-10 leading-relaxed">
                  Tu ecosistema de gestión está listo. Hemos procesado <span className="text-white font-bold">{dashboardStats?.conteoHoy || 0} ventas</span> hoy por un total de <span className="text-white font-bold">${(dashboardStats?.montoHoy || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span> en transacciones. Optimiza tus operaciones con inteligencia artificial.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group active:scale-95">
                    Ver Inventario <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95">
                    Configuración Rápida
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-gray-100 group hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs font-black rounded-full px-2 py-1 ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100 border border-gray-50 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Ventas por Día</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Últimos 7 días de actividad</p>
                  </div>
                  {/* Ir a la pantalla reportes */}
                  <button onClick={() => window.location.href = '/reporte-ventas'} className="text-indigo-600 font-bold text-sm hover:underline">Ver reporte completo</button>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <VentasBarChart ventas={reporteData} loading={loadingVentas} />
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100 border border-gray-50 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                    <FiUsers className="text-3xl text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm tracking-wide">Usuarios en línea</p>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </MainLayout>
      )}
    </>
  );
}

export default Home;