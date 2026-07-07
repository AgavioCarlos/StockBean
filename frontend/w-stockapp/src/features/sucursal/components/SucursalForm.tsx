import React from 'react';
import { IoIosSave } from "react-icons/io";
import { MdEdit, MdAdd, MdPowerSettingsNew, MdOutlineDateRange, MdStore, MdBusiness, MdLocalPhone, MdMailOutline, MdLocationOn, MdPersonOutline } from "react-icons/md";
import { Sucursal } from '../../../interfaces/sucursal.interface';
import { SharedInput } from '../../../components/SharedInput';
import { SharedButton } from '../../../components/SharedButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { WithPermission } from '../../../components/WithPermission';

interface SucursalFormProps {
    values: any;
    handleChange: (e: any) => void;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onSave: (e: React.FormEvent) => void;
    onNew: () => void;
    selection: Sucursal | null;
    onToggleStatus: (item: Sucursal) => void;
}

export const SucursalForm: React.FC<SucursalFormProps> = ({
    values,
    handleChange,
    isEditing,
    setIsEditing,
    onSave,
    onNew,
    selection,
    onToggleStatus
}) => {
    return (
        <div className="w-full h-full flex flex-col bg-slate-50/50">
            <form onSubmit={onSave} className="w-full h-full flex flex-col">
                <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10 shadow-sm transition-all">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-800">
                            {selection ? "Ficha de Sucursal" : "Añadir Nueva Sucursal"}
                        </h3>
                        {selection && (
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Identificador: #{String(selection.idSucursal || selection.id_sucursal).padStart(4, '0')}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {!isEditing && selection && (
                            <>
                                <WithPermission screen="sucursales" action="delete">
                                    <SharedButton
                                        type="button"
                                        variant={selection.status ? 'danger' : 'success'}
                                        onClick={() => onToggleStatus(selection)}
                                        title={selection.status ? "Desactivar Sucursal" : "Reactivar Sucursal"}
                                        aria-label={selection.status ? "Desactivar" : "Reactivar"}
                                        icon={<MdPowerSettingsNew size={20} aria-hidden="true" />}
                                    >
                                        {selection.status ? 'Desactivar' : 'Activar'}
                                    </SharedButton>
                                </WithPermission>

                                <WithPermission screen="sucursales" action="update">
                                    <SharedButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        title="Editar"
                                        aria-label="Editar"
                                        icon={<MdEdit size={20} aria-hidden="true" />}
                                    >
                                        Editar
                                    </SharedButton>
                                </WithPermission>
                            </>
                        )}

                        {isEditing && (
                            <WithPermission screen="sucursales" action="update">
                                <SharedButton
                                    type="submit"
                                    variant="primary"
                                    className="shadow-md shadow-blue-500/20"
                                    title="Guardar Sucursal"
                                    aria-label="Guardar Sucursal"
                                    icon={<IoIosSave size={20} aria-hidden="true" />}
                                >
                                    Guardar Cambios
                                </SharedButton>
                            </WithPermission>
                        )}

                        {!isEditing && (
                            <WithPermission screen="sucursales" action="create">
                                <SharedButton
                                    type="button"
                                    variant="primary"
                                    className="shadow-md shadow-blue-500/20"
                                    onClick={onNew}
                                    title="Nuevo"
                                    aria-label="Nuevo"
                                    icon={<MdAdd size={22} aria-hidden="true" />}
                                >
                                    Nueva Sucursal
                                </SharedButton>
                            </WithPermission>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-10 overflow-y-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {!isEditing && selection && (
                        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden relative group">

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-transform">
                                        <MdStore size={40} />
                                    </div>
                                    <div className="space-y-1 text-center md:text-left">
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{values.nombre}</h4>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-medium">
                                            <MdLocationOn size={16} />
                                            <span>{values.direccion || 'Domicilio no disponible'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <StatusBadge status={selection.status} trueText="Activo" falseText="Inactivo" />
                                    {values.fechaAlta && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            <MdOutlineDateRange />
                                            Registro: {new Date(values.fechaAlta).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
                        <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MdPersonOutline size={24} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">
                                    Información del Usuario
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <SharedInput
                                    label="Usuario"
                                    id="username"
                                    name="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    placeholder="Ej. admin"
                                />

                                <SharedInput
                                    label="Correo Electrónico"
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    placeholder="usuario@empresa.com"
                                />

                                <SharedInput
                                    label="Nombre"
                                    id="nombre"
                                    name="nombre"
                                    value={values.nombre}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    placeholder="Ej. Carlos"
                                />

                                <SharedInput
                                    label="Rol"
                                    id="rol"
                                    name="rol"
                                    value={values.rol}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    placeholder="Ej. Administrador"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="text-center pb-12 pt-4">
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                <MdOutlineDateRange className="animate-pulse" size={18} />
                                Modo de edición activo. No olvides guardar tus cambios.
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
