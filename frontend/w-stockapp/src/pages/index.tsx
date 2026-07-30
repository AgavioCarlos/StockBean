import { useEffect, useState } from 'react';
import Planes from '../components/Planes';
import Footer from "../components/Layouts/Footer";
import { FaRocket, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';

function Inicio() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-[#1D1D1F] selection:bg-blue-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
              <img src="/stock_icono.ico" alt="StockApp Icon" className="w-6 h-6 invert" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">StockApp</span>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={handleLogin}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 transform active:scale-95"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Nueva Versión 2.0
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[1.05]">
              Controla tu inventario<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">con precisión total.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-500 font-medium mb-12 leading-relaxed">
              La plataforma inteligente diseñada para potenciar la gestión de tu negocio. Simple, potente y escalable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] transition-all duration-300 transform hover:-translate-y-1"
              >
                Comenzar ahora
                <BsArrowRight strokeWidth={1} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                Ver demo interactiva
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              <FeatureCard
                icon={<FaRocket className="text-orange-500" />}
                title="Rápido y Ligero"
                description="Interfaz optimizada para una navegación instantánea y sin esperas."
              />
              <FeatureCard
                icon={<FaShieldAlt className="text-blue-500" />}
                title="Máxima Seguridad"
                description="Tus datos están protegidos con encriptación de grado bancario."
              />
              <FeatureCard
                icon={<FaChartLine className="text-green-500" />}
                title="Análisis Real"
                description="Reportes detallados para tomar decisiones basadas en datos reales."
              />
            </div>
          </div>
        </section>

        {/* Planes Section */}
        <section id="planes" className="bg-gray-50/50 py-24 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 mb-4">Planes que crecen contigo</h2>
              <p className="text-gray-500 font-medium">Elige el plan que mejor se adapte a tus necesidades actuales.</p>
            </div>

            <div className="home-container">
              <Planes />
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Empresas que confían en nosotros</h3>
            <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-40 grayscale filter transition-all hover:grayscale-0 hover:opacity-100">
              <span className="text-2xl font-black text-gray-400">STOCKAPP</span>
              <span className="text-2xl font-black text-gray-400">INVENSYS</span>
              <span className="text-2xl font-black text-gray-400">DATAFLOW</span>
              <span className="text-2xl font-black text-gray-400">CORELOGIC</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group p-8 bg-white border border-gray-100 rounded-[2rem] text-left hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-500 transform hover:-translate-y-2">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

export default Inicio;
