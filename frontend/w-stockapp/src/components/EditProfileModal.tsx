import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaIdCard, FaCheckCircle, FaSave, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { actualizarPersona } from '../features/Persona/PersonaService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    persona: any;
    onUpdate: (updatedPersona: any) => void;
}

const EditProfileModal = ({ isOpen, onClose, persona, onUpdate }: EditProfileModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        cuenta: '',
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (persona) {
            setFormData({
                nombre: persona.nombre || '',
                apellido_paterno: persona.apellido_paterno || '',
                apellido_materno: persona.apellido_materno || '',
                email: persona.email || '',
                cuenta: persona.cuenta || '',
                password: ''
            });
            setShowPassword(false);
        }
    }, [persona, isOpen]);

    if (!isOpen) return null;

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'El apellido paterno es requerido';
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsProcessing(true);

        try {
            const updatedData = {
                ...persona,
                ...formData
            };

            const response = await actualizarPersona(persona.id_persona, updatedData);

            if (response) {
                const storedData = localStorage.getItem("user_data");
                if (storedData) {
                    const userData = JSON.parse(storedData);
                    const { password, ...localDataToSave } = formData;
                    const newUserContext = { ...userData, ...localDataToSave };
                    localStorage.setItem("user_data", JSON.stringify(newUserContext));
                }

                await Swal.fire({
                    icon: 'success',
                    title: '¡Perfil Actualizado!',
                    text: 'Tus cambios se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                onUpdate(updatedData);
                onClose();
            }
        } catch (error: any) {
            console.error('Error al actualizar perfil:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar el perfil.',
                confirmButtonText: 'Cerrar'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform animate-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-300"
                    >
                        <FaTimes size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                            <FaUser size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Editar Perfil</h2>
                            <p className="text-blue-100 text-sm mt-1 opacity-90">Actualiza tu información personal</p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Nombre completo
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaIdCard size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.nombre ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                />
                                {errors.nombre && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.nombre}</p>}
                            </div>
                        </div>

                        {/* Apellido Paterno */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Apellido Paterno
                            </label>
                            <input
                                type="text"
                                name="apellido_paterno"
                                value={formData.apellido_paterno}
                                onChange={handleChange}
                                placeholder="Apellido Paterno"
                                className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.apellido_paterno ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'
                                    }`}
                            />
                            {errors.apellido_paterno && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.apellido_paterno}</p>}
                        </div>

                        {/* Apellido Materno */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Apellido Materno
                            </label>
                            <input
                                type="text"
                                name="apellido_materno"
                                value={formData.apellido_materno}
                                onChange={handleChange}
                                placeholder="Apellido Materno (Opcional)"
                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaEnvelope size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                />
                                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Nueva Contraseña (dejar en blanco para no cambiar)
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaLock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:ring-4 transition-all duration-300 ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Cuenta (Disabled) */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Identificador de Usuario (No editable)
                            </label>
                            <div className="relative opacity-60">
                                <input
                                    type="text"
                                    value={formData.cuenta}
                                    disabled
                                    className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-2xl cursor-not-allowed italic text-gray-500"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <FaCheckCircle className="text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`flex-[2] py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${isProcessing
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] hover:shadow-blue-200 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Guardando…</span>
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
