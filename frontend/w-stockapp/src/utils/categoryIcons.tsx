import React from "react";
import { 
    FaGlassWhiskey, 
    FaCheese, 
    FaSoap, 
    FaPencilAlt, 
    FaSeedling, 
    FaCookieBite, 
    FaCarrot,
    FaBoxOpen
} from "react-icons/fa";

/**
 * Retorna un elemento React (icono) basado en el nombre de la categoría del producto.
 */
export const getCategoryIcon = (categoryName: string, size = 64, className = ""): React.ReactNode => {
    const nameNormalized = (categoryName || "").toLowerCase().trim();

    if (nameNormalized.includes("bebida")) {
        return <FaGlassWhiskey size={size} className={className} />;
    }
    if (nameNormalized.includes("lacteo") || nameNormalized.includes("lácteo")) {
        return <FaCheese size={size} className={className} />;
    }
    if (nameNormalized.includes("higiene") || nameNormalized.includes("limpieza")) {
        return <FaSoap size={size} className={className} />;
    }
    if (nameNormalized.includes("papeleria") || nameNormalized.includes("papelería") || nameNormalized.includes("oficina")) {
        return <FaPencilAlt size={size} className={className} />;
    }
    if (nameNormalized.includes("materia prima") || nameNormalized.includes("materias primas") || nameNormalized.includes("ingrediente")) {
        return <FaSeedling size={size} className={className} />;
    }
    if (nameNormalized.includes("galleta") || nameNormalized.includes("dulce") || nameNormalized.includes("snack")) {
        return <FaCookieBite size={size} className={className} />;
    }
    if (nameNormalized.includes("verdura") || nameNormalized.includes("fruta") || nameNormalized.includes("vegetal") || nameNormalized.includes("campo") || nameNormalized.includes("hortaliza")) {
        return <FaCarrot size={size} className={className} />;
    }

    // Icono por defecto si no coincide con ninguna categoría conocida
    return <FaBoxOpen size={size} className={className} />;
};
