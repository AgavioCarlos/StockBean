import React, { useState, useEffect } from 'react';
import { IoIosSave, IoMdKey } from "react-icons/io";
import { MdEdit, MdAdd, MdPowerSettingsNew, MdOutlineDateRange, MdPersonOutline, MdOutlineEmail, MdOutlineAdminPanelSettings } from "react-icons/md";
import type { Usuario, Persona } from '../usuario.interface';
import { SharedInput } from '../../../components/SharedInput';
import { SharedButton } from '../../../components/SharedButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { consultarRoles } from '../../../services/Roles';
import { consultarPersonas } from '../../Persona/PersonaService';
import { UsuarioSucursales } from './UsuarioSucursales';
import { UsuarioFormProps } from '../usuario.interface';



export const UsuarioForm: React.FC<UsuarioFormProps> = ({
    values,
    handleChange,
    isEditing,
    setIsEditing,
    onSave,
    onNew,
    selection,
    onToggleStatus
}) => {
    const [roles, setRoles] = useState<any[]>([]);
    const [personas, setPersonas] = useState<Persona[]>([]);

    useEffect(() => {
        consultarRoles().then(setRoles).catch(console.error);
        consultarPersonas().then(setPersonas).catch(console.error);
    }, []);

    const persona = values.persona || {} as Persona;

    const handlePersonaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleChange({
            target: {
                name: 'persona',
                value: {
                    ...persona,
                    [name]: value
                }
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50/50 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10 shadow-sm transition-all">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-800">
                        {selection ? "Ficha de Usuario" : "Añadir Nuevo Usuario"}
                    </h3>
                    {selection && (
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                            Identificador: #{selection.id_usuario?.toString().padStart(4, '0')}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {!isEditing && selection && (
                        <>
                            <SharedButton
                                type="button"
                                variant={selection.status ? 'danger' : 'success'}
                                className={`shadow-sm transition-all ${selection.status ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                                onClick={() => onToggleStatus(selection)}
                                title={selection.status ? "Desactivar Usuario" : "Reactivar Usuario"}
                                aria-label={selection.status ? "Desactivar" : "Reactivar"}
                                icon={<MdPowerSettingsNew size={20} aria-hidden="true" />}
                            >
                                {selection.status ? '' : ''}
                            </SharedButton>

                            <SharedButton
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                title="Editar"
                                aria-label="Editar"
                                icon={<MdEdit size={20} aria-hidden="true" />}
                            >
                            </SharedButton>
                        </>
                    )}

                    {isEditing && (
                        <SharedButton
                            type="submit"
                            form="usuario-form"
                            variant="primary"
                            className="shadow-md shadow-blue-500/20"
                            title="Guardar Usuario"
                            aria-label="Guardar Usuario"
                            icon={<IoIosSave size={20} aria-hidden="true" />}
                        >
                            Guardar
                        </SharedButton>
                    )}

                    {!isEditing && (
                        <SharedButton
                            type="button"
                            variant="primary"
                            className="shadow-md shadow-blue-500/20"
                            onClick={onNew}
                            title="Agregar"
                            aria-label="Agregar"
                            icon={<MdAdd size={22} aria-hidden="true" />}
                        >
                            Agregar
                        </SharedButton>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 overflow-y-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!isEditing && selection && (
                        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mx-20 -my-20 opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-transform">
                                        {persona.nombre?.charAt(0)}{persona.apellido_paterno?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{persona.nombre} {persona.apellido_paterno} {persona.apellido_materno}</h4>
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <MdOutlineEmail className="text-slate-400" />
                                                <span>{persona.email || 'Sin correo registrado'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MdOutlineAdminPanelSettings className="text-slate-400" />
                                                <span className="font-semibold">{values.cuenta}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <StatusBadge status={selection.status} trueText="Activo" falseText="Inactivo" />
                                    {persona.fecha_alta && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            <MdOutlineDateRange />
                                            Registro: {new Date(persona.fecha_alta).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form id="usuario-form" onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Panel de Datos Personales y de Cuenta */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Información Personal */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
                                <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <MdPersonOutline size={24} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800">Información Personal</h4>
                                    </div>
                                    {isEditing && (
                                        <div className="flex-1 max-w-sm">
                                            <select
                                                name="persona_selector"
                                                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                                                onChange={(e) => {
                                                    const pid = e.target.value;
                                                    const p = personas.find(x => String(x.id_persona) === pid);
                                                    if (p) {
                                                        handleChange({
                                                            target: {
                                                                name: 'persona',
                                                                value: {
                                                                    ...persona,
                                                                    ...p
                                                                }
                                                            }
                                                        });
                                                    }
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="">-- Cargar persona existente --</option>
                                                {personas.map((p) => (
                                                    <option key={p.id_persona} value={p.id_persona}>
                                                        {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <SharedInput
                                        label="Nombre"
                                        id="nombre"
                                        name="nombre"
                                        value={persona.nombre || ''}
                                        onChange={handlePersonaChange}
                                        isEditing={isEditing}
                                        placeholder="Ej. Juan Andrés"
                                    />
                                    <SharedInput
                                        label="Correo Electrónico"
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={persona.email || ''}
                                        onChange={handlePersonaChange}
                                        isEditing={isEditing}
                                        placeholder="correo@empresa.com"
                                    />
                                    <SharedInput
                                        label="Apellido Paterno"
                                        id="apellido_paterno"
                                        name="apellido_paterno"
                                        value={persona.apellido_paterno || ''}
                                        onChange={handlePersonaChange}
                                        isEditing={isEditing}
                                        placeholder="Ej. Pérez"
                                    />
                                    <SharedInput
                                        label="Apellido Materno"
                                        id="apellido_materno"
                                        name="apellido_materno"
                                        value={persona.apellido_materno || ''}
                                        onChange={handlePersonaChange}
                                        isEditing={isEditing}
                                        placeholder="Ej. García"
                                    />
                                </div>
                            </div>

                            {/* Información de la Cuenta */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-3xl"></div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <MdOutlineAdminPanelSettings size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">Datos de la Cuenta</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <SharedInput
                                        label="Nombre de Cuenta"
                                        id="cuenta"
                                        name="cuenta"
                                        value={values.cuenta}
                                        onChange={handleChange}
                                        isEditing={isEditing}
                                        placeholder="Ej. jxPerez"
                                    />
                                    <SharedInput
                                        label="Contraseña"
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={values.password || ''}
                                        onChange={handleChange}
                                        isEditing={isEditing}
                                        placeholder={selection ? "Dejar vacío para conservar actual" : "Requerido para nuevo usuario"}
                                    />
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Rol del Usuario</label>
                                        {isEditing ? (
                                            <select
                                                name="id_rol"
                                                value={values.id_rol || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                                            >
                                                <option value="">Seleccione un rol...</option>
                                                {roles.map((r: any) => (
                                                    <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-600 font-medium">
                                                {roles.find(r => r.id_rol === values.id_rol)?.nombre || 'No asignado'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Lateral: Detalles de Sistema */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Estado del Sistema</h4>
                                <div className="space-y-5 cursor-default">
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-semibold text-slate-600">Estatus Operativo</span>
                                        <StatusBadge status={values.status ?? true} trueText="Activo" falseText="Inactivo" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-semibold text-slate-600">Ingreso</span>
                                        <span className="text-sm font-bold text-slate-800">
                                            {persona.fecha_alta ? new Date(persona.fecha_alta).toLocaleDateString() : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    {selection?.id_usuario && (
                        <div className="pt-4">
                            <UsuarioSucursales idUsuario={selection.id_usuario} />
                        </div>
                    )}

                    {/* Mensaje de Asistencia (Solo visible si esEditing) */}
                    <div className="text-center pb-12 pt-4">
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${isEditing ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'text-slate-400 border border-transparent opacity-0 translate-y-2'}`}>
                            <MdOutlineDateRange className="animate-pulse" size={18} />
                            {isEditing && "Modo de edición activado. Recuerda guardar tus cambios en la barra superior."}
                        </div>
                    </div>
                </div>
        </div>
    );
};
