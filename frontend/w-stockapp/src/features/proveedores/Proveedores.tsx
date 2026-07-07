import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdBusiness, MdBlock } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { consultarProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from "./ProveedoresService";
import type { IProveedor } from "./proveedor.interface";
import { Column } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { ProveedoresList } from "./components/ProveedoresList";
import { ProveedoresForm } from "./components/ProveedoresForm";
import { useCRUD } from "../../hooks/useCRUD";
import { usePermissions } from "../../hooks/useAuth";

export default function Proveedores() {
    const permisos = usePermissions("proveedores");
    const {
        dataList: proveedoresList,
        selectedItem: proveedorSeleccionado,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        loading: loadingProveedores,
        values,
        handleChange,
        handleRowClick,
        newFromDetail,
        handleSubmit,
        handleDeleteOrRestore,
        confirm
    } = useCRUD<IProveedor>({
        fetchData: consultarProveedores,
        createData: crearProveedor,
        updateData: actualizarProveedor,
        deleteData: eliminarProveedor,
        initialFormValues: {
            nombre: "",
            direccion: "",
            email: "",
            fechaAlta: "",
            status: true
        },
        getId: (item) => item.idProveedor,
        validate: (vals) => {
            if (!vals.nombre) {
                return "El nombre o razón social es obligatorio";
            }
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


    const onRowSelect = (item: IProveedor) => {
        handleRowClick(item, (p) => ({
            nombre: p.nombre,
            direccion: p.direccion || "",
            email: p.email || "",
            fechaAlta: p.fechaAlta,
            status: p.status
        }));
    };

    const onSave = (e: React.FormEvent) => {
        handleSubmit(e, (vals, selected) => ({
            nombre: vals.nombre,
            direccion: vals.direccion,
            email: vals.email,
            status: selected ? selected.status : true
        }));
    };

    const columnas = useMemo<Column<IProveedor>[]>(() => [
        {
            key: "nombre",
            label: "Razón Social / Nombre",
            render: (_, item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.nombre}</span>
                    {item.email && <span className="text-xs text-gray-500">{item.email}</span>}
                </div>
            )
        },
        {
            key: "direccion",
            label: "Dirección",
            render: (val) => <span className="text-gray-600 truncate max-w-[200px] block">{val || 'No registrada'}</span>
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


    const onToggleStatus = useCallback((item: IProveedor) => {
        const isDeactivating = item.status;
        confirm(
            "¿Estás seguro?",
            `¿Estás seguro de que deseas ${isDeactivating ? 'desactivar' : 'reactivar'} el proveedor "${item.nombre}"?`,
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
            label: "Lista",
            icon: <IoMdList aria-hidden="true" />,
            content: (
                <ProveedoresList
                    data={proveedoresList}
                    columns={columnas}
                    onRowClick={onRowSelect}
                    onNew={newFromDetail}
                    loading={loadingProveedores}
                />
            )
        },
        {
            key: "detalle",
            label: "Detalle",
            icon: <MdDescription aria-hidden="true" />,
            content: (
                <ProveedoresForm
                    values={values}
                    handleChange={handleChange}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={onSave}
                    onNew={newFromDetail}
                    selection={proveedorSeleccionado}
                    onToggleStatus={onToggleStatus}
                />
            )
        }
    ], [
        proveedoresList, columnas, onRowSelect, newFromDetail, loadingProveedores,
        values, handleChange, isEditing, setIsEditing, onSave, proveedorSeleccionado,
        onToggleStatus
    ]);

    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <Breadcrumb
                    showBackButton={true}
                    items={[
                        { label: "Home", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
                        { label: "Proveedores", icon: <MdBusiness aria-hidden="true" /> },
                    ]}
                />

                {!permisos.canView ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col items-center gap-4 text-center px-6 py-16">
                            <div className="p-4 bg-rose-50 rounded-2xl">
                                <MdBlock size={48} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Acceso restringido</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                No tienes permiso para ver esta pantalla. Contacta a tu administrador para solicitar acceso.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-visible bg-white rounded-xl shadow-sm border border-gray-200 relative">
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

