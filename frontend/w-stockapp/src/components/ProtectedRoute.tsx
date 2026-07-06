import { Navigate, useLocation } from "react-router-dom";
import { usePantallas } from "../hooks/usePantallas";
import { useStyles } from "../hooks/useStyles";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePermission?: boolean;
}

const ProtectedRoute = ({
    children,
    requirePermission = true
}: ProtectedRouteProps) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const location = useLocation();
    const { hasAccess, loading: loadingPantallas } = usePantallas();

    const { loading: loadingStyles } = useStyles();

    const loading = loadingPantallas || loadingStyles;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (!requirePermission) {
        return children;
    }
    if (loading) {
        console.log("ProtectedRoute: Loading permissions...");
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }
    const currentPath = location.pathname;

    // Lista de rutas públicas que no requieren validación de permisos
    const publicRoutes = ["/home", "/perfil", "/configuracion", "/unauthorized"];

    if (publicRoutes.includes(currentPath)) {
        return children;
    }

    // 5️⃣ Validar si tiene acceso a la ruta
    const access = hasAccess(currentPath);
    console.log(`ProtectedRoute: hasAccess(${currentPath}) = ${access}`);

    if (!access) {
        console.warn(`⛔ Acceso denegado a: ${currentPath}`);
        return <Navigate to="/unauthorized" replace />;
    }
    console.log(`ProtectedRoute: Access granted to ${currentPath}. Rendering children.`);
    return children;
};

export default ProtectedRoute;