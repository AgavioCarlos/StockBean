import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdPeople } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { consultarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from "./UsuarioService";
import type { Usuario } from "./usuario.interface";
import { Column } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { UsuarioList } from "./components/UsuarioList";
import { UsuarioForm } from "./components/UsuarioForm";
import { useCRUD } from "../../hooks/useCRUD";
import { consultarRoles } from "../../services/Roles";

export default function Usuarios() {
    const [rolesMap, setRolesMap] = useState<Record<number, string>>({});

    useEffect(() => {
        consultarRoles().then(roles => {
            const map: Record<number, string> = {};
            roles.forEach((r: any) => { map[r.id_rol] = r.nombre; });
            setRolesMap(map);
        }).catch(console.error);
    }, []);

    const {
        dataList: usuariosList,
        selectedItem: usuarioSeleccionado,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        loading: loadingUsuarios,
        values,
        handleChange,
        handleRowClick,
        newFromDetail,
        handleSubmit,
        handleDeleteOrRestore,
        confirm
    } = useCRUD<Usuario>({
        fetchData: consultarUsuarios,
        createData: crearUsuario,
        updateData: actualizarUsuario,
        deleteData: eliminarUsuario,
        initialFormValues: {
            persona: {
                nombre: "",
                apellido_paterno: "",
                apellido_materno: "",
                email: "",
                fecha_alta: "",
                status: true
            },
            cuenta: "",
            password: "",
            id_rol: 0,
            status: true
        },
        getId: (item) => item.id_usuario,
        validate: (vals) => {
            if (!vals.persona?.nombre || !vals.persona?.apellido_paterno || !vals.persona?.email || !vals.cuenta || !vals.id_rol) {
                return "Complete los campos obligatorios del usuario.";
            }
            return null;
        },
        statusField: "status",
        defaultStatus: true
    });

    const onRowSelect = (item: Usuario) => {
        handleRowClick(item, (u) => ({
            persona: u.persona,
            cuenta: u.cuenta,
            id_rol: u.id_rol,
            status: u.status,
            password: ""
        }));
    };

    const onSave = async (e: React.FormEvent) => {
        handleSubmit(e, (vals, selected) => {
            const personaPayload = vals.persona?.id_persona
                ? { id_persona: vals.persona.id_persona }
                : vals.persona;

            const payload: any = {
                persona: personaPayload,
                cuenta: vals.cuenta,
                rol: { id_rol: Number(vals.id_rol) },
                status: selected ? selected.status : true
            };
            if (vals.password) {
                payload.password = vals.password;
            }
            return payload;
        });
    };

    const columnas = useMemo<Column<Usuario>[]>(() => [
        {
            key: "persona",
            label: "Nombre completo",
            render: (_, item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.persona?.nombre}</span>
                    <span className="text-xs text-gray-500">{item.persona?.apellido_paterno} {item.persona?.apellido_materno}</span>
                </div>
            )
        },
        {
            key: "cuenta",
            label: "Cuenta",
            render: (val) => <span className="text-gray-600 font-semibold">{val}</span>
        },
        {
            key: "id_rol",
            label: "Rol",
            render: (val) => <span className="text-gray-600 truncate max-w-xs">{rolesMap[Number(val)] || val}</span>
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
    ], [rolesMap]);

    const onToggleStatus = useCallback((item: Usuario) => {
        const isDeactivating = item.status;
        confirm(
            "¿Estás seguro?",
            `¿Estás seguro de que deseas ${isDeactivating ? 'desactivar' : 'reactivar'} el acceso para el usuario "${item.cuenta}"?`,
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
                <UsuarioList
                    data={usuariosList}
                    columns={columnas}
                    onRowClick={onRowSelect}
                    onNew={newFromDetail}
                    loading={loadingUsuarios}
                />
            )
        },
        {
            key: "detalle",
            label: "Detalle",
            icon: <MdDescription aria-hidden="true" />,
            content: (
                <UsuarioForm
                    values={values}
                    handleChange={handleChange}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={onSave}
                    onNew={newFromDetail}
                    selection={usuarioSeleccionado}
                    onToggleStatus={onToggleStatus}
                />
            )
        }
    ], [
        usuariosList, columnas, onRowSelect, newFromDetail, loadingUsuarios,
        values, handleChange, isEditing, setIsEditing, onSave, usuarioSeleccionado,
        onToggleStatus
    ]);

    const navigate = useNavigate();

    return (
        // <MainLayout rightPanel={<UsuarioMetricsSidebar />}>
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <Breadcrumb
                    showBackButton={true}
                    items={[
                        { label: "Administración", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
                        { label: "Usuarios", icon: <MdPeople aria-hidden="true" /> },
                    ]}
                />

                <div className="flex-1 overflow-hiddn bg-white rounded-xl shadow-sm border border-gray-200 relative">
                    <Tabs
                        tabs={items}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
