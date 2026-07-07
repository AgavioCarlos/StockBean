import React from 'react';
import { IoIosSave } from "react-icons/io";
import { MdEdit, MdAdd, MdPowerSettingsNew, MdOutlineDateRange, MdPersonOutline, MdOutlineEmail } from "react-icons/md";
import type { Persona } from '../persona.interface';
import { SharedInput } from '../../../components/SharedInput';
import { SharedButton } from '../../../components/SharedButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { WithPermission } from '../../../components/WithPermission';

interface PersonaFormProps {
    values: any;
    handleChange: (e: any) => void;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onSave: (e: React.FormEvent) => void;
    onNew: () => void;
    selection: Persona | null;
    onToggleStatus: (item: Persona) => void;
}

export const PersonaForm: React.FC<PersonaFormProps> = ({
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
                            {selection ? "Ficha de Persona" : "Añadir Nueva Persona"}
                        </h3>
                        {selection && (
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Identificador: #{selection.id_persona?.toString().padStart(4, '0')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing && selection && (
                            <>
                                <WithPermission screen="personas" action="delete">
                                    <SharedButton
                                        type="button"
                                        variant={selection.status ? 'danger' : 'success'}
                                        className={`shadow-sm transition-all ${selection.status ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                                        onClick={() => onToggleStatus(selection)}
                                        title={selection.status ? "Desactivar" : "Reactivar"}
                                        aria-label={selection.status ? "Desactivar" : "Reactivar"}
                                        icon={<MdPowerSettingsNew size={20} aria-hidden="true" />}
                                    >
                                    </SharedButton>
                                </WithPermission>

                                <WithPermission screen="personas" action="update">
                                    <SharedButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        title="Editar"
                                        aria-label="Editar"
                                        icon={<MdEdit size={20} aria-hidden="true" />}
                                    >
                                    </SharedButton>
                                </WithPermission>
                            </>
                        )}

                        {isEditing && (
                            <WithPermission screen="personas" action="update">
                                <SharedButton
                                    type="submit"
                                    variant="primary"
                                    className="shadow-md shadow-blue-500/20"
                                    title="Guardar"
                                    aria-label="Guardar"
                                    icon={<IoIosSave size={20} aria-hidden="true" />}
                                >
                                </SharedButton>
                            </WithPermission>
                        )}

                        {!isEditing && (
                            <WithPermission screen="personas" action="create">
                                <SharedButton
                                    type="button"
                                    variant="primary"
                                    className="shadow-md shadow-blue-500/20"
                                    onClick={onNew}
                                    title="Agregar"
                                    aria-label="Agregar"
                                    icon={<MdAdd size={22} aria-hidden="true" />}
                                >
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
                                        {values.nombre?.charAt(0)}{values.apellido_paterno?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{values.nombre} {values.apellido_paterno} {values.apellido_materno}</h4>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MdOutlineEmail className="text-slate-400" />
                                            <span>{values.email || 'Sin correo registrado'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <StatusBadge status={selection.status} trueText="Activo" falseText="Inactivo" />
                                    {values.fecha_alta && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            <MdOutlineDateRange />
                                            Registro: {new Date(values.fecha_alta).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
                        {/* Panel de Datos Personales */}
                        <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MdPersonOutline size={24} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">Información Personal</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <SharedInput
                                    label="Nombre"
                                    id="nombre"
                                    name="nombre"
                                    value={values.nombre}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    autoComplete="given-name"
                                    placeholder="Ej. Juan Andrés"
                                />

                                <SharedInput
                                    label="Apellido Paterno"
                                    id="apellido_paterno"
                                    name="apellido_paterno"
                                    value={values.apellido_paterno}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    autoComplete="family-name"
                                    placeholder="Ej. Pérez"
                                />

                                <SharedInput
                                    label="Apellido Materno"
                                    id="apellido_materno"
                                    name="apellido_materno"
                                    value={values.apellido_materno}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    autoComplete="off"
                                    placeholder="Ej. García"
                                />

                                <SharedInput
                                    label="Correo Electrónico"
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    isEditing={isEditing}
                                    spellCheck={false}
                                    autoComplete="email"
                                    placeholder="correo@empresa.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de Asistencia (Solo visible si esEditing) */}
                    <div className="text-center pb-12 pt-4">
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${isEditing ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'text-slate-400 border border-transparent opacity-0 translate-y-2'}`}>
                            <MdOutlineDateRange className="animate-pulse" size={18} />
                            {isEditing && "Modo de edición activado. Recuerda guardar tus cambios en la barra superior."}
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};
