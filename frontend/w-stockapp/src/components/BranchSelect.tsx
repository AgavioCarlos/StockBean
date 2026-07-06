import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { consultarEmpresas } from '../services/Empresas';
import { consultarSucursalesPorEmpresa } from '../features/Sucursal/SucursalService';
import { obtenerPorIdUsuario } from '../services/UsuarioSucursalService';
import { Sucursal } from '../interfaces/sucursal.interface';
import { SearchableSelect } from './SearchableSelect';

interface BranchSelectProps {
    value: number | "";
    onChange: (idSucursal: number | "") => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    showEmpresaSelector?: boolean;
}

export const BranchSelect: React.FC<BranchSelectProps> = ({
    value,
    onChange,
    label = "Sucursal",
    placeholder = "Elegir sucursal...",
    disabled = false,
    className = "",
    showEmpresaSelector = true
}) => {
    const { user, isSistem, isCajero } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");

    const normalizedValue = useMemo(() => {
        if (value === 0 || value === "0" || !value) return "";
        return Number(value);
    }, [value]);

    useEffect(() => {
        if (!user) return;
        const loadInitial = async () => {
            setLoading(true);
            try {
                if (isSistem) {
                    const emps = await consultarEmpresas();
                    setEmpresas(emps || []);
                } else {
                    const userSucs = await obtenerPorIdUsuario(user.id_usuario);
                    const mapped = (userSucs || []).filter(s => s.status).map(us => ({
                        id_sucursal: Number(us.idSucursal || (us as any).id_sucursal),
                        nombre: us.nombre,
                        direccion: us.direccion
                    })) as any;
                    setSucursales(mapped);
                    
                    if (mapped.length === 1 && !normalizedValue) {
                        onChange(mapped[0].id_sucursal);
                    }
                }
            } catch (e) {
                console.error("[BranchSelect] Error:", e);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, [user, isSistem]);

    useEffect(() => {
        if (isSistem && idEmpresa) {
            setLoading(true);
            consultarSucursalesPorEmpresa(Number(idEmpresa))
                .then(data => {
                    const mapped = (data || []).map(s => ({
                        id_sucursal: Number(s.id_sucursal || (s as any).idSucursal),
                        nombre: s.nombre,
                        direccion: s.direccion
                    }));
                    setSucursales(mapped);
                })
                .finally(() => setLoading(false));
        }
    }, [idEmpresa, isSistem]);

    const opts = useMemo(() => sucursales.map(s => ({
        value: Number(s.id_sucursal),
        label: s.nombre,
        description: s.direccion
    })), [sucursales]);

    const empOpts = useMemo(() => empresas.map(e => ({
        value: Number(e.idEmpresa),
        label: e.nombreComercial || e.razonSocial
    })), [empresas]);

    return (
        <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
            {isSistem && showEmpresaSelector && (
                <div className="flex-1">
                    <SearchableSelect
                        label="Empresa"
                        options={empOpts}
                        value={idEmpresa}
                        onChange={(val) => {
                            const numId = Number(val);
                            setIdEmpresa(numId);
                            setSucursales([]); // Limpiar sucursales al cambiar empresa
                            onChange("");      // Limpiar sucursal elegida
                        }}
                        placeholder="Filtrar por empresa..."
                    />
                </div>
            )}
            <div className="flex-1">
                <SearchableSelect
                    label={label}
                    options={opts}
                    value={normalizedValue}
                    onChange={(val) => onChange(val === "" ? "" : Number(val))}
                    placeholder={loading ? "Cargando..." : (sucursales.length === 0 && isSistem && !idEmpresa ? "Elige empresa primero" : placeholder)}
                    loading={loading}
                    disabled={disabled || (isCajero && sucursales.length === 1)}
                />
            </div>
        </div>
    );
};
