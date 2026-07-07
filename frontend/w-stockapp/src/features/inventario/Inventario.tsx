import React, { useEffect, useState, useMemo, useCallback } from "react";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoIosSave, IoMdAddCircle, IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdDelete, MdBlock, MdPowerSettingsNew, MdEdit, MdAdd, MdBusiness, MdInventory } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { useAlerts } from "../../hooks/useAlerts";
import { consultarInventario, crearInventario, actualizarInventario, eliminarInventario } from "./InventarioService";
import { useLOVs } from "../../hooks/useLOVs";
import { inventario } from "./inventario.interface";
import { Column, DataTable } from "../../components/DataTable";
import { useAuth, } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { StatusBadge, StockBadge } from "../../components/StatusBadge";
import { ExcelButton, PdfButton, SharedButton } from "../../components/SharedButton";
import { SearchableSelect } from "../../components/SearchableSelect";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/useAuth";
import { WithPermission } from "../../components/WithPermission";
import { RefreshButton } from "../../components/RefreshButton";

export default function Inventario() {
    const navigate = useNavigate();
    const permisos = usePermissions("inventario");
    const { success, error: showError, warning, confirm, info } = useAlerts();
    const [inventarioList, setInventarioList] = useState<inventario[]>([]);
    const { data: lovs, loading: loadingLovs } = useLOVs(["productos", "tipo_precios", "sucursales"]);

    const productOptions = useMemo(() => (lovs.productos || []).map((p: any) => ({
        value: p.id_producto || p.idProducto,
        label: p.nombre,
        description: p.codigoBarras ? `Barras: ${p.codigoBarras}` : undefined
    })), [lovs.productos]);

    const priceTypeOptions = useMemo(() => (lovs.tipo_precios || []).map((t: any) => ({
        value: t.id_tipo_precio || t.idTipoPrecio,
        label: t.nombre,
        description: t.porcentaje ? `Margen: ${t.porcentaje}%` : undefined
    })), [lovs.tipo_precios]);

    const [invSelected, setInvSelected] = useState<inventario | null>(null);
    const [activeTab, setActiveTab] = useState("lista");
    const [isEditing, setIsEditing] = useState(false);
    const [loadingInventario, setLoadingInventario] = useState(false);
    const { user } = useAuth();
    const [idSucursalSeleccionada, setIdSucursalSeleccionada] = useState<number | "">("");

    const { values, handleChange, setValues, resetForm } = useForm({
        idProducto: 0 as number,
        stockActual: 0,
        stockMinimo: 0,
        precioCompra: 0,
        precioVenta: 0,
        idTipoPrecio: 0 as number,
        motivo: "" as string
    });

    const refreshData = useCallback(() => {
        setLoadingInventario(true);
        setInventarioList([]);
    }, []);

    useEffect(() => {
        if (idSucursalSeleccionada === "") {
            if (user?.id_sucursal) {
                setIdSucursalSeleccionada(Number(user.id_sucursal));
            }
            else {
                warning("Atención", "No tiene una sucursal asignada, por favor contacte al administrador");
            }
        }
    }, [loadingLovs, lovs.sucursales, idSucursalSeleccionada, user]);

    const handleRowClick = useCallback((item: inventario) => {
        setInvSelected(item);
        setValues({
            idProducto: item.producto?.id_producto || 0,
            stockActual: item.stock_actual,
            stockMinimo: item.stock_minimo,
            precioCompra: item.precioAnterior || 0,
            precioVenta: item.precioNuevo || 0,
            idTipoPrecio: item.idTipoPrecio || 0,
            motivo: item.motivo || ""
        });

        if (item.sucursal) {
            const itemColBranchId = item.sucursal.id_sucursal || item.sucursal.idSucursal;
            if (itemColBranchId) setIdSucursalSeleccionada(itemColBranchId);
        }
        setIsEditing(false);
        setActiveTab("detalle");
    }, [setValues]);

    const nuevoDesdeDetalle = useCallback(() => {
        setInvSelected(null);
        resetForm();
        setIsEditing(true);
        setActiveTab("detalle");
    }, [resetForm]);

    const refrescarInventario = useCallback(async () => {
        if (idSucursalSeleccionada && user) {
            setLoadingInventario(true);
            try {
                const data = await consultarInventario(Number(idSucursalSeleccionada));
                setInventarioList(data);
            } finally {
                setLoadingInventario(false);
            }
        }
    }, [idSucursalSeleccionada, user]);

    const manejarEnvio = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const { idProducto, stockActual, stockMinimo, motivo } = values;

        // if (!invSelected) {
        //     const alreadyExists = inventarioList.some(
        //         item => Number(item.producto?.id_producto) === Number(idProducto)
        //     );
        //     if (alreadyExists) {
        //         warning("Atención", "Este producto ya está registrado en el inventario de esta sucursal. Por favor, edite el registro existente.");
        //         return;
        //     }
        // }

        const payload: Partial<inventario> = {
            producto: { id_producto: Number(idProducto) },
            sucursal: { idSucursal: Number(idSucursalSeleccionada) },
            stock_actual: Number(stockActual),
            stock_minimo: Number(stockMinimo),
            status: true,
            precioNuevo: Number(values.precioVenta),
            precioAnterior: Number(values.precioCompra),
            idTipoPrecio: Number(values.idTipoPrecio),
            motivo: motivo
        };

        try {
            if (invSelected && invSelected.id_inventario) {
                await actualizarInventario(invSelected.id_inventario, payload);
                success("Éxito", "Inventario actualizado correctamente");
            } else {
                await crearInventario(payload);
                success("Éxito", "Inventario creado correctamente");
            }
            await refrescarInventario();
            setActiveTab("lista");
        } catch (err) {
            console.error("Error al guardar:", err);
            showError("Error", "Ocurrió un error al guardar");
        }
    }, [idSucursalSeleccionada, values, user, invSelected, inventarioList, refrescarInventario, warning, success, info, showError]);

    const handleDelete = useCallback(async (id: number) => {
        if (!user) return;
        try {
            await eliminarInventario(id);
            success("Eliminado", "Registro eliminado correctamente");
            await refrescarInventario();
            if (invSelected?.id_inventario === id) {
                nuevoDesdeDetalle();
                setActiveTab("lista");
            }
        } catch (err) {
            console.error("Error el eliminar", err);
            showError("Error", "No se pudo eliminar el registro");
        }
    }, [user, refrescarInventario, invSelected, nuevoDesdeDetalle, success, showError]);

    useEffect(() => {
        if (idSucursalSeleccionada && user) {
            setLoadingInventario(true);
            consultarInventario(idSucursalSeleccionada)
                .then(setInventarioList)
                .catch(err => {
                    console.error(err);
                    showError("Error", "Error al cargar inventario");
                })
                .finally(() => setLoadingInventario(false));
        } else {
            setInventarioList([]);
        }
    }, [idSucursalSeleccionada, user, showError]);



    useEffect(() => {
        setIsEditing(!invSelected);
    }, [invSelected]);

    useEffect(() => {
        if (!invSelected && values.idProducto && inventarioList.length > 0) {
            const existing = inventarioList.find(
                item => Number(item.producto?.id_producto) === Number(values.idProducto)
            );

            if (existing) {
                handleRowClick(existing);
                info("Producto Detectado", "Este producto ya cuenta con un registro en el inventario. Cargando datos para actualizar.");
            }
        }
    }, [values.idProducto, invSelected, inventarioList, handleRowClick, info]);

    const columnas = useMemo<Column<inventario>[]>(() => [
        {
            key: "producto",
            label: "Producto",
            render: (p) => <div className="flex flex-col"><span className="font-medium text-gray-900">{p?.nombre || "N/A"}</span><span className="text-xs text-gray-400">{p?.codigoBarras}</span></div>
        },
        {
            key: "stock_actual",
            label: "Stock",
            render: (stock, item) => (
                <StockBadge current={stock} min={item.stock_minimo} showText={false} />
            )
        },
        {
            key: "stock_minimo",
            label: "Mínimo",
            render: (val) => <span className="text-gray-400 font-medium">{val}</span>
        },
        {
            key: "id_inventario",
            label: "Estado",
            sortable: true,
            valueGetter: (item) => item.stock_actual <= item.stock_minimo ? "A-Bajo" : "Z-Normal",
            render: (_, item) => (
                <StatusBadge
                    status={item.stock_actual > item.stock_minimo}
                    trueText="Óptimo"
                    falseText="Bajo"
                />
            )
        },
        {
            key: "id_inventario",
            label: "Acciones",
            sortable: false,
            render: (_, item) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirm(
                                "¿Estás seguro?",
                                `¿Estás seguro de que deseas eliminar este registro de inventario para "${item.producto?.nombre}"?`,
                                "Sí, eliminar"
                            ).then((isConfirmed) => {
                                if (isConfirmed) {
                                    handleDelete(item.id_inventario!);
                                }
                            });
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        title="Eliminar"
                    >
                        <MdDelete size={16} />
                    </button>
                </div>
            )
        }
    ], [confirm, handleDelete]);

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <Breadcrumb
                    showBackButton={true}
                    items={[
                        { label: "Home", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
                        { label: "Inventario", icon: <IoMdList aria-hidden="true" /> },
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
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            tabs={[
                                {
                                    key: "lista",
                                    label: "Lista",
                                    icon: <IoMdList />,
                                    content: (
                                        <div className="flex flex-col h-full w-full relative">
                                            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-10">
                                                {loadingInventario && (
                                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-2xl transition-all duration-300">
                                                        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" aria-hidden="true"></div>
                                                        <span className="text-xs font-medium text-slate-500" aria-live="polite">Actualizando inventario…</span>
                                                    </div>
                                                )}
                                                <DataTable
                                                    data={inventarioList}
                                                    columns={columnas}
                                                    onRowClick={handleRowClick}
                                                    actionContent={
                                                        <WithPermission screen="inventario" action="create">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                                                <RefreshButton onRefresh={refreshData} showText={false} />
                                                                <PdfButton onClick={() => { }} />
                                                                <ExcelButton onClick={() => { }} />
                                                            </div>
                                                            <SharedButton
                                                                onClick={nuevoDesdeDetalle}
                                                                variant="primary"
                                                                size="icon"
                                                                title="Nuevo Inventario"
                                                                aria-label="Nuevo Inventario"
                                                                icon={<IoMdAddCircle size={28} aria-hidden="true" />}
                                                            />
                                                        </WithPermission>
                                                    }
                                                />
                                                {inventarioList.length === 0 && !loadingInventario && (
                                                    <div className="p-20 text-center">
                                                        <p className="text-slate-400 italic text-sm">
                                                            {idSucursalSeleccionada
                                                                ? "No se encontraron productos en esta sucursal."
                                                                : "Selecciona una sucursal para ver las existencias."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: "detalle",
                                    label: "Detalle",
                                    icon: <MdDescription />,
                                    content: (
                                        <div className="w-full h-full flex flex-col bg-slate-50/50">
                                            <form onSubmit={manejarEnvio} className="w-full h-full flex flex-col">

                                                <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10 shadow-sm transition-all">
                                                    <div>
                                                        <h3 className="text-xl font-bold tracking-tight text-slate-800">
                                                            {invSelected ? "Inventario" : "Agregar Inventario"}
                                                        </h3>
                                                        {invSelected && (
                                                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                                Identificador: #{String(invSelected.id_inventario || invSelected.id_inventario).padStart(4, '0')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {!isEditing && invSelected && (
                                                            <>
                                                                <WithPermission screen="inventario" action="delete">
                                                                    <SharedButton
                                                                        type="button"
                                                                        variant={invSelected.status ? 'danger' : 'success'}
                                                                        onClick={() => handleDelete(invSelected.id_inventario!)}
                                                                        title={invSelected.status ? "Desactivar Inventario" : "Reactivar Inventario"}
                                                                        icon={<MdPowerSettingsNew size={22} aria-hidden="true" />}
                                                                    >
                                                                    </SharedButton>
                                                                </WithPermission>

                                                                <WithPermission screen="inventario" action="update">
                                                                    <SharedButton
                                                                        type="button"
                                                                        variant="secondary"
                                                                        onClick={() => setIsEditing(true)}
                                                                        title="Editar"
                                                                        icon={<MdEdit size={22} aria-hidden="true" />}
                                                                    >
                                                                    </SharedButton>
                                                                </WithPermission>
                                                            </>
                                                        )}

                                                        {isEditing && (
                                                            <WithPermission screen="inventario" action="update">
                                                                <SharedButton
                                                                    type="submit"
                                                                    variant="primary"
                                                                    className="shadow-md shadow-blue-500/20"
                                                                    title="Guardar Inventario"
                                                                    icon={<IoIosSave size={20} aria-hidden="true" />}
                                                                >
                                                                </SharedButton>
                                                            </WithPermission>
                                                        )}

                                                        {!isEditing && (
                                                            <WithPermission screen="inventario" action="create">
                                                                <SharedButton
                                                                    type="button"
                                                                    variant="primary"
                                                                    className="shadow-md shadow-blue-500/20"
                                                                    onClick={nuevoDesdeDetalle}
                                                                    title="Agregar"
                                                                    icon={<MdAdd size={22} aria-hidden="true" />}
                                                                >
                                                                </SharedButton>
                                                            </WithPermission>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 p-6 md:p-1 overflow-y-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                                                    <div className="lg:col-span-8 bg-white p-8 rounded-3xl  relative overflow-hidden">
                                                        {/* <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div> */}
                                                        <div className="flex items-center gap-3 mb-10">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                                <MdInventory size={24} />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-slate-800">Información</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                            <div className="md:col-span-1">
                                                                <SearchableSelect
                                                                    label="Producto"
                                                                    options={productOptions}
                                                                    value={values.idProducto}
                                                                    onChange={(val) => setValues({ ...values, idProducto: Number(val) })}
                                                                    disabled={!isEditing}
                                                                    placeholder="Buscar un producto..."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-1">
                                                                <SearchableSelect
                                                                    label="Tipo de Precio"
                                                                    options={priceTypeOptions}
                                                                    value={values.idTipoPrecio}
                                                                    onChange={(val) => setValues({ ...values, idTipoPrecio: Number(val) })}
                                                                    disabled={!isEditing}
                                                                    placeholder="Buscar tipo de precio..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Actual</label>
                                                                <input type="number" name="stockActual" value={values.stockActual} onChange={handleChange} disabled={!isEditing}
                                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all font-bold text-slate-700 bg-white shadow-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Mínimo</label>
                                                                <input type="number" name="stockMinimo" value={values.stockMinimo} onChange={handleChange} disabled={!isEditing}
                                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all text-slate-700 bg-white shadow-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Precio Compra</label>
                                                                <input type="number" step="0.01" name="precioCompra" value={values.precioCompra} onChange={handleChange} disabled={!isEditing}
                                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all text-slate-700 bg-white shadow-sm" />
                                                            </div>

                                                            <div className="lg:col-span-3 space-y-2">
                                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 text-indigo-600">Precio Venta</label>
                                                                <input type="number" step="0.01" name="precioVenta" value={values.precioVenta} onChange={handleChange} disabled={!isEditing}
                                                                    className="w-full h-11 px-4 rounded-xl border border-indigo-200 focus:ring-4 focus:ring-indigo-100 transition-all font-black text-indigo-700 bg-indigo-50/30 text-lg shadow-sm" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
