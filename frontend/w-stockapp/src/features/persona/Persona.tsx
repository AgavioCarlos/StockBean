import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdPeople } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { consultarPersonas, crearPersona, actualizarPersona, eliminarPersona } from "./PersonaService";
import type { Persona } from "./persona.interface";
import { DataTable, Column } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { PersonaForm } from "./components/PersonaForm";
import { useCRUD } from "../../hooks/useCRUD";
import { SharedButton } from '../../components/SharedButton';
import { IoMdAddCircle } from "react-icons/io";
import { WithPermission } from '../../components/WithPermission';

export default function Persona() {
  const {
    dataList: personasList,
    selectedItem: personaSeleccionada,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading: loadingPersonas,
    values,
    handleChange,
    handleRowClick,
    newFromDetail,
    handleSubmit,
    handleDeleteOrRestore,
    confirm
  } = useCRUD<Persona>({
    fetchData: consultarPersonas,
    createData: crearPersona,
    updateData: actualizarPersona,
    deleteData: eliminarPersona,
    initialFormValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      fecha_alta: "",
      status: true
    },
    getId: (item) => item.id_persona,
    validate: (vals) => {
      if (!vals.nombre || !vals.apellido_paterno || !vals.email) {
        return "Nombre, apellido paterno y email son obligatorios";
      }
      return null;
    },
    statusField: "status",
    defaultStatus: true
  });

  const onRowSelect = (item: Persona) => {
    handleRowClick(item, (p) => ({
      nombre: p.nombre,
      apellido_paterno: p.apellido_paterno,
      apellido_materno: p.apellido_materno,
      email: p.email,
      fecha_alta: p.fecha_alta,
      status: p.status
    }));
  };

  const onSave = (e: React.FormEvent) => {
    handleSubmit(e, (vals, selected) => ({
      nombre: vals.nombre,
      apellido_paterno: vals.apellido_paterno,
      apellido_materno: vals.apellido_materno,
      email: vals.email,
      status: selected ? selected.status : true
    }));
  };

  const columnas = useMemo<Column<Persona>[]>(() => [
    {
      key: "nombre",
      label: "Nombre completo",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.nombre}</span>
          <span className="text-xs text-gray-500">{item.apellido_paterno} {item.apellido_materno}</span>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (val) => <span className="text-gray-600">{val}</span>
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


  const onToggleStatus = useCallback((item: Persona) => {
    const isDeactivating = item.status;
    confirm(
      "¿Estás seguro?",
      `¿Estás seguro de que deseas ${isDeactivating ? 'desactivar' : 'reactivar'} el registro para "${item.nombre}"?`,
      isDeactivating ? "Sí, desactivar" : "Sí, reactivar"
    ).then((isConfirmed) => {
      if (isConfirmed) {
        handleDeleteOrRestore(item);
      }
    });
  }, [confirm, handleDeleteOrRestore]);

  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50">
        <Breadcrumb
          showBackButton={true}
          items={[
            { label: "Administración", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
            { label: "Personas", icon: <MdPeople aria-hidden="true" /> },
          ]}
        />

        <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 relative">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                key: "lista",
                label: "Lista",
                icon: <IoMdList aria-hidden="true" />,
                content: (
                  <div className="flex flex-col h-full w-full relative">
                    {loadingPersonas && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-2xl transition-all duration-300">
                        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" aria-hidden="true"></div>
                        <span className="text-xs font-medium text-slate-500" aria-live="polite">Actualizando personas…</span>
                      </div>
                    )}

                    <DataTable
                      data={personasList}
                      columns={columnas}
                      onRowClick={onRowSelect}
                      actionContent={
                        <WithPermission screen="personas" action="create">
                          <SharedButton
                            onClick={newFromDetail}
                            variant="primary"
                            size="icon"
                            title="Nueva Persona"
                            aria-label="Nueva Persona"
                            icon={<IoMdAddCircle size={28} aria-hidden="true" />}
                          />
                        </WithPermission>
                      }
                    />
                  </div>
                )
              },
              {
                key: "detalle",
                label: "Detalle",
                icon: <MdDescription aria-hidden="true" />,
                content: (
                  <PersonaForm
                    values={values}
                    handleChange={handleChange}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={onSave}
                    onNew={newFromDetail}
                    selection={personaSeleccionada}
                    onToggleStatus={onToggleStatus}
                  />
                )
              }

            ]}

          />
        </div>
      </div>
    </MainLayout>
  );
}
