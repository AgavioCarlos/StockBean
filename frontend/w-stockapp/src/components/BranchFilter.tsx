import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { consultarEmpresas } from '../services/Empresas';
import {
    consultarSucursalesPorEmpresa
} from '../features/Sucursal/SucursalService';
import { obtenerPorIdUsuario } from '../services/UsuarioSucursalService';
import { Sucursal } from '../interfaces/sucursal.interface';
import { SearchableSelect } from './SearchableSelect';
import { consultarProveedores } from '../features/Proveedores/ProveedoresService';
import { Proveedor } from '../features/Proveedores/proveedor.interface';

interface BranchFilterProps {
    onBranchChange: (idSucursal: number | "") => void;
    onEmpresaChange?: (idEmpresa: number | "") => void;
    onProveedorChange?: (idProveedor: number | "") => void;
    value?: number | "";
    labelEmpresa?: string;
    labelSucursal?: string;
    labelProveedor?: string;
    placeholderEmpresa?: string;
    placeholderSucursal?: string;
    placeholderProveedor?: string;
    className?: string;
    disabled?: boolean;
}

export const BranchFilter: React.FC<BranchFilterProps> = ({
    onBranchChange,
    onEmpresaChange,
    onProveedorChange,
    value,
    labelEmpresa = "Empresa",
    labelSucursal = "Sucursal",
    labelProveedor = "Proveedor",
    placeholderEmpresa = "Seleccionar empresa…",
    placeholderSucursal = "Seleccionar sucursal…",
    placeholderProveedor = "Seleccionar proveedor…",
    className = "",
    disabled = false
}) => {
    const { user, isSistem, isAdmin, isGerente, isCajero } = useAuth();

    const [empresasList, setEmpresasList] = useState<any[]>([]);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");

    const [sucursalesList, setSucursalesList] = useState<Sucursal[]>([]);
    const [idSucursal, setIdSucursal] = useState<number | "">(value || "");

    const [proveedoresList, setProveedoresList] = useState<Proveedor[]>([]);
    const [idProveedor, setIdProveedor] = useState<number | "">(value || "");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value !== undefined) {
            setIdSucursal(value);
        }
    }, [value]);

    // Transform lists to options for SearchableSelect
    const empresasOptions = useMemo(() =>
        empresasList.map(emp => ({
            value: emp.idEmpresa,
            label: emp.nombreComercial || emp.razonSocial,
            description: emp.nif ? `NIF: ${emp.nif}` : undefined
        })), [empresasList]);

    const sucursalesOptions = useMemo(() =>
        sucursalesList.map(suc => ({
            value: suc.id_sucursal || (suc as any).idSucursal,
            label: suc.nombre,
            description: suc.direccion ? `Dirección: ${suc.direccion}` : undefined
        })), [sucursalesList]);

    const proveedoresOptions = useMemo(() =>
        proveedoresList.map(prov => ({
            value: prov.idProveedor,
            label: prov.nombre,
            description: prov.email ? `Email: ${prov.email}` : undefined
        })), [proveedoresList]);

    useEffect(() => {
        if (!user) return;

        const loadInitialData = async () => {
            setLoading(true);
            try {
                if (isSistem) {
                    const companies = await consultarEmpresas();
                    setEmpresasList(companies || []);
                } else {
                    const userSucs = await obtenerPorIdUsuario(user.id_usuario);
                    const mappedSucs = userSucs.filter(s => s.status).map(us => ({
                        id_sucursal: us.idSucursal,
                        nombre: us.nombre,
                        direccion: us.direccion
                    })) as any;

                    setSucursalesList(mappedSucs);

                    if (mappedSucs && mappedSucs.length === 1) {
                        const sId = mappedSucs[0].id_sucursal;
                        if (sId) {
                            setIdSucursal(sId);
                            onBranchChange(sId);
                            const provs = await consultarProveedores();
                            setProveedoresList(provs || []);
                        }
                    } else if (isCajero && mappedSucs.length > 0) {
                        const sId = mappedSucs[0].id_sucursal;
                        setIdSucursal(sId);
                        onBranchChange(sId);
                    }




                }
            } catch (error) {
                console.error("[BranchFilter] Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user, isSistem, isCajero, onBranchChange]);

    // 2. Handle Empresa Change
    const handleEmpresaChangeInternal = useCallback(async (val: string | number) => {
        const numVal = val === "" ? "" : Number(val);
        setIdEmpresa(numVal);
        setIdSucursal(""); // Clear branch
        setSucursalesList([]);
        onBranchChange(""); // Clear parent branch
        if (onEmpresaChange) onEmpresaChange(numVal);

        if (numVal) {
            setLoading(true);
            try {
                let sucs = await consultarSucursalesPorEmpresa(Number(numVal));

                // Si NO es SISTEM, validamos estrictamente que la sucursal exista en sus permisos
                if (!isSistem && user) {
                    const userSucs = await obtenerPorIdUsuario(user.id_usuario);
                    const allowedIds = new Set(userSucs.filter(u => u.status).map(u => u.idSucursal));
                    sucs = sucs.filter(s => allowedIds.has(s.id_sucursal || (s as any).idSucursal));
                }

                setSucursalesList(sucs || []);
            } catch (error) {
                console.error("[BranchFilter] Error loading branches for company:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [onBranchChange, onEmpresaChange]);

    // 3. Handle Sucursal Change
    const handleSucursalChangeInternal = useCallback((val: string | number) => {
        const numVal = val === "" ? "" : Number(val);
        setIdSucursal(numVal);
        onBranchChange(numVal);
    }, [onBranchChange]);

    const handleProveedorChangeInternal = useCallback((val: string | number) => {
        const numVal = val === "" ? "" : Number(val);
        setIdProveedor(numVal);
        if (onProveedorChange) onProveedorChange(numVal);
    }, [onProveedorChange]);

    return (
        <div className={`flex flex-wrap gap-4 items-center ${className}`}>
            {/* Empresa Selector (SISTEM only) */}
            {isSistem && (
                <div className="min-w-[240px]">
                    <SearchableSelect
                        label={labelEmpresa}
                        placeholder={placeholderEmpresa}
                        options={empresasOptions}
                        value={idEmpresa}
                        onChange={handleEmpresaChangeInternal}
                        loading={loading}
                        disabled={disabled}
                    />
                </div>
            )}

            {/* Sucursal Selector (SISTEM, ADMIN, GERENTE, CAJERO) */}
            {(isSistem || isAdmin || isGerente || isCajero) && (
                <div className="min-w-[240px]">
                    <SearchableSelect
                        label={labelSucursal}
                        placeholder={sucursalesList.length === 0 ? "Sin sucursales" : placeholderSucursal}
                        options={sucursalesOptions}
                        value={idSucursal}
                        onChange={handleSucursalChangeInternal}
                        disabled={disabled || (isCajero && sucursalesList.length === 1)}
                        loading={loading}
                    />
                </div>
            )}

            {/* Proveedor Selector (SISTEM, ADMIN, GERENTE, CAJERO) */}
            {(isSistem || isAdmin || isGerente || isCajero) && (
                <div className="min-w-[240px]">
                    <SearchableSelect
                        label={labelProveedor}
                        placeholder={proveedoresList.length === 0 ? "Sin proveedores" : placeholderProveedor}
                        options={proveedoresOptions}
                        value={idProveedor}
                        onChange={handleProveedorChangeInternal}
                        disabled={disabled || (isCajero && proveedoresList.length === 1)}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};
