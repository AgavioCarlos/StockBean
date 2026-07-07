import React, { ChangeEvent } from 'react';
import { IoMdCube } from 'react-icons/io';
import { FormGrid, FormCol } from '../../../components/ui';
import { SharedInput } from '../../../components/SharedInput';
import { SharedTextarea } from '../../../components/SharedTextarea';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface ProductosFormProps {
    values: any;
    handleChange: (e: any) => void;
    setValues: (values: any) => void;
    isEditing: boolean;
    loadingLovs: boolean;
    lovOptions: {
        categorias: any[];
        marcas: any[];
        unidades: any[];
        productos: any[];
    };
    imagenUrl: string;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ProductosForm: React.FC<ProductosFormProps> = ({
    values,
    handleChange,
    setValues,
    isEditing,
    loadingLovs,
    lovOptions,
    imagenUrl,
    onImageChange,
}) => {
    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-8 min-h-[400px]">
                {/* Columna Imagen */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className={`
                    aspect-square lg:aspect-auto lg:h-80 border-2 border-dashed rounded-card 
                    bg-slate-50/50 transition-all flex flex-col items-center justify-center 
                    overflow-hidden relative group
                    ${isEditing ? 'border-empresa-primario/30 hover:border-empresa-primario/60 hover:bg-white cursor-pointer' : 'border-slate-200'}
                `}>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            disabled={!isEditing}
                            className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                        />

                        {imagenUrl ? (
                            <img
                                src={imagenUrl}
                                alt="Vista previa"
                                className="w-full h-full object-contain p-4"
                            />
                        ) : (
                            <div className="text-center p-6 flex flex-col items-center gap-3">
                                <div className={`transition-colors duration-300 ${isEditing ? 'text-empresa-primario/40 group-hover:text-empresa-primario' : 'text-slate-200'}`}>
                                    <IoMdCube size={64} />
                                </div>
                                <p className="text-sm font-bold text-slate-400">
                                    {isEditing ? "Subir imagen" : "Sin imagen"}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-wider">
                        Formatos: JPG, PNG, WEBP. Máx 2MB.
                    </p>
                </div>

                {/* Columna Campos */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">

                    <FormGrid cols={5} gap={4}>
                        <FormCol span={3}>
                            <SharedInput
                                label="Nombre del Producto"
                                id="nombre"
                                name="nombre"
                                value={values.nombre || ''}
                                onChange={handleChange}
                                isEditing={isEditing}
                                required
                                placeholder="Ej. Coca Cola 600ml"
                            />
                        </FormCol>
                        <FormCol span={2}>
                            <SharedInput
                                label="Código de Barras"
                                id="codigoBarras"
                                name="codigoBarras"
                                value={values.codigoBarras || ''}
                                onChange={handleChange}
                                isEditing={isEditing}
                                className="font-mono text-sm"
                                placeholder="0000000000"
                            />
                        </FormCol>
                    </FormGrid>

                    <SharedTextarea
                        label="Descripción detalla"
                        id="descripcion"
                        name="descripcion"
                        value={values.descripcion || ''}
                        onChange={handleChange}
                        isEditing={isEditing}
                        rows={4}
                        placeholder="Escribe características, ingredientes o notas relevantes..."
                    />

                    <FormGrid cols={3} gap={4}>
                        <FormCol>
                            <SearchableSelect
                                label="Categoría"
                                id="idCategoria"
                                options={lovOptions.categorias}
                                value={values.idCategoria ?? 0}
                                onChange={(val) => setValues({ ...values, idCategoria: Number(val) })}
                                disabled={!isEditing || loadingLovs}
                                loading={loadingLovs}
                                placeholder="Seleccionar..."
                            />
                        </FormCol>
                        <FormCol>
                            <SearchableSelect
                                label="Marca"
                                id="idMarca"
                                options={lovOptions.marcas}
                                value={values.idMarca ?? 0}
                                onChange={(val) => setValues({ ...values, idMarca: Number(val) })}
                                disabled={!isEditing || loadingLovs}
                                loading={loadingLovs}
                                placeholder="Seleccionar..."
                            />
                        </FormCol>
                        <FormCol>
                            <SearchableSelect
                                label="Unidad"
                                id="idUnidad"
                                options={lovOptions.unidades}
                                value={values.idUnidad ?? 0}
                                onChange={(val) => setValues({ ...values, idUnidad: Number(val) })}
                                disabled={!isEditing || loadingLovs}
                                loading={loadingLovs}
                                placeholder="Seleccionar..."
                            />
                        </FormCol>
                    </FormGrid>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex justify-center">
                        <span className="text-xs text-slate-400 font-medium italic">
                            {isEditing
                                ? "Completa todos los campos obligatorios para guardar."
                                : "Modo visualización. Haz clic en Editar para realizar cambios."
                            }
                        </span>
                    </div>
                </div>
            </div>

        </div>

    );
};