import { useEffect, useState } from "react";
import { getDisenoEmpresa, EmpresaDiseno } from "../services/EmpresaDisenoService";

export const useStyles = () => {
    const [styles, setStyles] = useState<EmpresaDiseno | null>(null);
    const [loading, setLoading] = useState(true);
    const DEFAULT_DISENO: EmpresaDiseno = {
        colorPrimario: "#3b82f6", // Blue 500
        colorSecundario: "#1e293b", // Slate 800
        colorAcento: "#f59e0b", // Amber 500
        colorFondo: "#f8fafc", // Slate 50
        fuenteFamilia: "'Instrument Sans', system-ui, sans-serif",
        estiloBoton: "rounded-md",
        redondeoComponentes: "0.375rem",
        temaOscuroHabilitado: false
    };

    const aplicarEstilos = (estilos: EmpresaDiseno) => {
        const root = document.documentElement;
        
        // Colores base
        root.style.setProperty("--color-primario", estilos.colorPrimario);
        root.style.setProperty("--color-secundario", estilos.colorSecundario);
        root.style.setProperty("--color-acento", estilos.colorAcento);
        root.style.setProperty("--color-fondo", estilos.colorFondo);
        
        // Tipografía y estructura
        root.style.setProperty("--fuente-familia", estilos.fuenteFamilia);
        root.style.setProperty("--redondeo-componentes", estilos.redondeoComponentes);
        
        // Favicon dinámico si existe
        if (estilos.urlFavicon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = estilos.urlFavicon;
        }

        // Aplicamos la fuente al body
        document.body.style.fontFamily = estilos.fuenteFamilia;
    };

    const cargarEstilos = async () => {
        const idEmpresa = localStorage.getItem("id_empresa");
        
        if (!idEmpresa) {
            setStyles(DEFAULT_DISENO);
            aplicarEstilos(DEFAULT_DISENO);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getDisenoEmpresa(parseInt(idEmpresa));
            
            if (data && Object.keys(data).length > 0) {
                // Resolver ruta local de Vite si la imagen fue subida (no es una URL de red)
                if (data.urlLogo && !data.urlLogo.startsWith('http')) {
                    data.urlLogo = `/src/assets/logos/${idEmpresa}/${data.urlLogo}`;
                }

                setStyles(data);
                aplicarEstilos(data);
            } else {
                // Si no hay registro en la DB, usar los defaults
                setStyles(DEFAULT_DISENO);
                aplicarEstilos(DEFAULT_DISENO);
            }
        } catch (error) {
            console.error("Error cargando estilos:", error);
            setStyles(DEFAULT_DISENO);
            aplicarEstilos(DEFAULT_DISENO);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEstilos();
        
        // Listener para cambios en el almacenamiento (por si se cambia de empresa en otra pestaña)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "id_empresa") {
                cargarEstilos();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return { styles, loading, recargarEstilos: cargarEstilos };
};
