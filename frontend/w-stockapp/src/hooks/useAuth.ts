import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserSession } from '../interfaces/UserSession.interface';

export const useAuth = () => {
    const [user, setUser] = useState<UserSession | null>(() => {
        const uDataStr = localStorage.getItem("usuario") || localStorage.getItem("user_data");
        if (uDataStr) {
            try {
                return JSON.parse(uDataStr);
            } catch (e) {
                console.error("Error parsing user data from localStorage", e);
                localStorage.removeItem("usuario");
                localStorage.removeItem("user_data");
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        if (!user) {
            const uDataStr = localStorage.getItem("usuario") || localStorage.getItem("user_data");
            if (uDataStr) {
                try {
                    setUser(JSON.parse(uDataStr));
                } catch (e) { }
            }
        }
        setLoading(false);
    }, [user]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("user_data");
        setUser(null);
        window.location.href = "/login";
    }, []);

    const roles = useMemo(() => ({
        isSistem: user?.id_rol === 1,
        isAdmin: user?.id_rol === 2,
        isGerente: user?.id_rol === 3,
        isCajero: user?.id_rol === 4,
        roleName: user?.id_rol === 1 ? 'SISTEM' :
            user?.id_rol === 2 ? 'ADMIN' :
                user?.id_rol === 3 ? 'GERENTE' :
                    user?.id_rol === 4 ? 'CAJERO' : 'UNKNOWN'
    }), [user?.id_rol]);

    return {
        user,
        loading,
        logout,
        ...roles,
        isAuthenticated: !!user?.token
    };
};

export const usePermissions = (pantallaKey: string) => {
    const { user, loading } = useAuth();

    const DENIED = {
        canView: false,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
        loading: loading
    };

    if (loading) return DENIED;

    const permisosCrud = user?.permisos_crud;
    if (!permisosCrud || Object.keys(permisosCrud).length === 0) {
        if (user?.id_rol === 1) {
            return { ...DENIED, canView: true, canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true, loading: false };
        }
        return DENIED;
    }

    const empresaKeys = Object.keys(permisosCrud);
    const activeEmpresaKey = localStorage.getItem('id_empresa') || empresaKeys[0] || '';
    const permisosPorPantalla = permisosCrud[activeEmpresaKey as any];

    if (!permisosPorPantalla) {
        if (user?.id_rol === 1) {
            return { ...DENIED, canView: true, canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true, loading: false };
        }
        return DENIED;
    }

    const accionesPermitidas = (permisosPorPantalla[pantallaKey] || []).map((p: string) => p.toLowerCase());

    const canView = accionesPermitidas.includes('ver');

    return {
        canView,
        canCreate: canView && accionesPermitidas.includes('guardar'),
        canRead: canView, // backward compat alias
        canUpdate: canView && accionesPermitidas.includes('actualizar'),
        canDelete: canView && accionesPermitidas.includes('eliminar'),
        canExport: canView,
        loading: false
    };
};
