import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { consultarProveedores } from '../features/Proveedores/ProveedoresService';
import { Proveedor } from '../features/Proveedores/proveedor.interface';

interface SupplierSelectProps {
    value: number | "";
    onChange: (idProveedor: number | "") => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
    value,
    onChange,
    label = "Proveedor",
    placeholder = "Elegir proveedor...",
    disabled = false,
    className = ""
}) => {
    const [loading, setLoading] = useState(false);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);

    useEffect(() => {
        setLoading(true);
        consultarProveedores()
            .then(setProveedores)
            .catch(err => console.error("[SupplierSelect] Error:", err))
            .finally(() => setLoading(false));
    }, []);

    const opts = useMemo(() => proveedores.map(p => ({
        value: p.idProveedor,
        label: p.nombre,
        description: p.email
    })), [proveedores]);

    return (
        <SearchableSelect
            label={label}
            options={opts}
            value={value}
            onChange={(val) => onChange(Number(val))}
            placeholder={placeholder}
            loading={loading}
            disabled={disabled}
            className={className}
        />
    );
};
