import { useState, useEffect } from "react";
import { Pantalla } from "../interfaces/pantalla.interface";
import {
    getPantallasFromLocalStorage,
    getPantallasUsuario,
    savePantallasToLocalStorage,
} from "../services/Pantallas";

export const usePantallas = () => {
    const [pantallas, setPantallas] = useState<Pantalla[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPantallasFromStorage();
    }, []);

    const loadPantallasFromStorage = () => {
        const storedPantallas = getPantallasFromLocalStorage();
        if (storedPantallas) {
            setPantallas(storedPantallas);
        }
        setLoading(false);
    };

    const reloadPantallas = async () => {
        try {
            setLoading(true);
            const sucursal = localStorage.getItem("id_sucursal") || "";
            const nuevasPantallas = await getPantallasUsuario(sucursal);
            savePantallasToLocalStorage(nuevasPantallas);
            setPantallas(nuevasPantallas);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error al recargar pantallas:", error);
            setLoading(false);
            return false;
        }
    };


    const hasAccess = (ruta: string): boolean => {
        return pantallas.some((p) => p.ruta === ruta);
    };

    const getPantallaByRuta = (ruta: string): Pantalla | undefined => {
        return pantallas.find((p) => p.ruta === ruta);
    };

    return {
        pantallas,
        loading,
        hasAccess,
        getPantallaByRuta,
        reloadPantallas,
        loadPantallasFromStorage,
    };
};
