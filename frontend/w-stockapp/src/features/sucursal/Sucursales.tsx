import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdStore, MdBlock } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { consultarSucursalesPorSolicitante, crearSucursal, actualizarSucursal, eliminarSucursal } from "../Sucursal/SucursalService";
import { Sucursal } from "../../interfaces/sucursal.interface";
import { Column } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { SucursalesList } from "./components/SucursalesList";
import { SucursalForm } from "./components/SucursalForm";
import { useCRUD } from "../../hooks/useCRUD";
import { usePermissions } from "../../hooks/useAuth";

export default function Sucursales() {
    const permisos = usePermissions("sucursales");
    const navigate = useNavigate();

    const {
        dataList: sucursalesList,
        selectedItem: sucursalSeleccionada,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        loading: loadingSucursales,
        values,
        handleChange,
        handleRowClick,
        newFromDetail,
        handleSubmit,
        handleDeleteOrRestore,
        confirm
    } = useCRUD<Sucursal>({
        fetchData: consultarSucursalesPorSolicitante,
        createData: crearSucursal,
        updateData: actualizarSucursal,
        deleteData: eliminarSucursal,
        initialFormValues: {
            nombre: "",
            direccion: "",
            telefono: "",
            email: "",
            fechaAlta: "",
            status: true
        },
        getId: (item) => item.idSucursal || item.id_sucursal,
        validate: (vals) => {
            if (!vals.nombre) return "El nombre de la sucursal es obligatorio";
            return null;
        },
        statusField: "status",
        defaultStatus: true
    });

    if (permisos.loading) {
        return (
            <MainLayout>
                <div className="flex flex-col h-full bg-slate-50">
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm font-medium text-slate-400">Validando accesos...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const onRowSelect = (item: Sucursal) => {
        handleRowClick(item, (s) => ({
            nombre: s.nombre,
            direccion: s.direccion || "",
            telefono: s.telefono || "",
            email: s.email || "",
            fechaAlta: s.fechaAlta || s.fecha_alta || "",
            status: s.status
        }));
    };

    const onSave = (e: React.FormEvent) => {
        handleSubmit(e, (vals, selected) => ({
            nombre: vals.nombre,
            direccion: vals.direccion,
            telefono: vals.telefono,
            email: vals.email,
            status: selected ? selected.status : true
        }));
    };

    const columnas = useMemo<Column<Sucursal>[]>(() => [
        {
            key: "nombre",
            label: "Sucursal",
            sortable: true,
            render: (_, item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 tracking-tight">{item.nombre}</span>
                    <span className="text-xs text-slate-400 font-medium">{item.email || 'Sin correo registrado'}</span>
                </div>
            )
        },
        {
            key: "direccion",
            label: "Ubicación",
            sortable: true,
            render: (val) => <span className="text-slate-500 font-medium truncate max-w-[200px] block">{val || 'N/A'}</span>
        },
        {
            key: "telefono",
            label: "Contacto",
            render: (val) => <span className="text-slate-600 font-bold">{val || 'S/T'}</span>
        },
        {
            key: "status",
            label: "Estado",
            sortable: true,
            valueGetter: (item) => item.status ? "1" : "0",
            render: (status) => (
                <StatusBadge
                    status={status as boolean}
                    trueText="Activo"
                    falseText="Inactivo"
                />
            )
        }
    ], []);

    const onToggleStatus = useCallback((item: Sucursal) => {
        const isDeactivating = item.status;
        confirm(
            "¿Estás seguro?",
            `¿Deseas ${isDeactivating ? 'desactivar' : 'reactivar'} la sucursal "${item.nombre}"?`,
            isDeactivating ? "Sí, desactivar" : "Sí, reactivar"
        ).then((isConfirmed) => {
            if (isConfirmed) {
                handleDeleteOrRestore(item);
            }
        });
    }, [confirm, handleDeleteOrRestore]);

    const items = useMemo(() => [
        {
            key: "lista",
            label: "Lista de Sucursales",
            icon: <IoMdList aria-hidden="true" />,
            content: (
                <SucursalesList
                    data={sucursalesList}
                    columns={columnas}
                    onRowClick={onRowSelect}
                    onNew={newFromDetail}
                    loading={loadingSucursales}
                />
            )
        },
        {
            key: "detalle",
            label: "Ficha Técnica",
            icon: <MdDescription aria-hidden="true" />,
            content: (
                <SucursalForm
                    values={values}
                    handleChange={handleChange}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={onSave}
                    onNew={newFromDetail}
                    selection={sucursalSeleccionada}
                    onToggleStatus={onToggleStatus}
                />
            )
        }
    ], [
        sucursalesList, columnas, onRowSelect, newFromDetail, loadingSucursales,
        values, handleChange, isEditing, setIsEditing, onSave, sucursalSeleccionada,
        onToggleStatus
    ]);

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <Breadcrumb
                    showBackButton={true}
                    items={[
                        { label: "Home", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
                        { label: "Sucursales", icon: <MdStore aria-hidden="true" /> },
                    ]}
                />

                {!permisos.canView ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 m-4">
                        <div className="flex flex-col items-center gap-4 text-center px-6 py-16">
                            <div className="p-4 bg-rose-50 rounded-2xl">
                                <MdBlock size={48} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Acceso denegado</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                No tienes autorización para gestionar las sucursales. Contacta con el equipo de soporte.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-visible bg-white rounded-2xl shadow-sm border border-slate-200 m-4 relative overflow-hidden">
                        <Tabs
                            tabs={items}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
