import { useNavigate } from "react-router-dom";
import { FiShield, FiHome, FiArrowLeft } from "react-icons/fi";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-6 rounded-full">
                        <FiShield className="text-red-600 text-6xl" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-800 mb-2">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Acceso Denegado
                </h2>
                <p className="text-gray-600 mb-8">
                    No tienes permisos para acceder a esta página.
                    Si crees que esto es un error, contacta al administrador del sistema.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        <FiArrowLeft />Volver Atrás
                    </button>
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    ><FiHome />Ir al Inicio
                    </button>
                </div>
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        💡 <strong>Consejo:</strong> Verifica que estés usando la cuenta correcta
                        o solicita los permisos necesarios a tu administrador.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
