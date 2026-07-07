import { useMemo, useCallback } from "react";
import MainLayout from "../../components/Layouts/MainLayout";
import Breadcrumb from "../../components/Breadcrumb";
import { FaHome } from "react-icons/fa";
import {
    HiOutlineShoppingCart,
    HiOutlineDocumentPlus,
    HiOutlineListBullet,
    HiOutlineCalendarDays,
    HiOutlineBuildingOffice2
} from "react-icons/hi2";

import { useCRUD } from "../../hooks/useCRUD";
import { Compra } from "./compras.interface";
import {
    consultarCompras,
    registrarCompra,
    actualizarCompra
} from "./ComprasService";

import Tabs from "../../components/Tabs";
import { DataTable, Column } from "../../components/DataTable";
import { SharedButton } from "../../components/SharedButton";
import { SectionHeader, EmptyState } from "../../components/ui";
import { ComprasForm } from "./components/ComprasForm";

function ComprasPage() {

    const crud = useCRUD<Compra>({
        fetchData: consultarCompras,
        createData: registrarCompra,
        updateData: actualizarCompra,
        deleteData: async () => { throw new Error("No se pueden eliminar compras"); },
        getId: (c) => c.idCompra,
        initialFormValues: {
            idSucursal: "" as number | "",
            idProveedor: "" as number | "",
            fechaCompra: new Date().toISOString().split('T')[0] + 'T12:00:00',
            total: 0,
            observaciones: "",
            detalles: []
        }
    });
    

    const {
        dataList,
        activeTab,
        setActiveTab,
        selectedItem,
        isEditing,
        setIsEditing,
        values,
        setValues,
        refreshData,
        handleRowClick,
        newFromDetail,
        handleSubmit
    } = crud;

    const handleNewFromDetail = useCallback(() => {
        newFromDetail();
        setIsEditing(true);
    }, [newFromDetail, setIsEditing]);

    const onBranchChange = useCallback((id: number | "") => {
        setValues({ idSucursal: id });
    }, [setValues]);

    const onProveedorChange = useCallback((id: number | "") => {
        setValues({ idProveedor: id });
    }, [setValues]);

    // 2. Definición de Columnas para el Listado Principal
    const columns = useMemo<Column<Compra>[]>(() => [
        {
            key: "idCompra",
            label: "ID",
            render: (val: number) => (
                <span className="font-mono text-indigo-500 font-bold">#{val}</span>
            )
        },
        {
            key: "fechaCompra",
            label: "Fecha",
            sortable: true,
            render: (val: string) => {
                if (!val) return "—";
                const date = new Date(val);
                return (
                    <div className="flex flex-col">
                        <span className="text-slate-700 font-medium">
                            {date.toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "nombreSucursal",
            label: "Sucursal",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <HiOutlineBuildingOffice2 className="text-slate-300" />
                    <span className="text-slate-600 font-medium">{val || "—"}</span>
                </div>
            )
        },
        { key: "nombreProveedor", label: "Proveedor" },
        {
            key: "total",
            label: "Total",
            sortable: true,
            render: (val: number) => (
                <span className="font-bold text-slate-800">${(val || 0).toLocaleString()}</span>
            )
        },
        {
            key: "idCompra",
            label: "",
            render: (_, item) => (
                <SharedButton
                    variant="ghost"
                    icon={<HiOutlineListBullet />}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleRowClick(item, (c) => c);
                    }}
                    title="Ver detalle"
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-500"
                />
            )
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    // 3. Tabs
    const tabItems = useMemo(() => [
        {
            key: "lista",
            label: "Compras",
            icon: <HiOutlineListBullet />,
            content: (
                <div className="p-4">
                    {/* Acciones */}
                    <div className="flex justify-end mb-4">
                        <SharedButton
                            title="Nueva Compra"
                            icon={<HiOutlineDocumentPlus />}
                            onClick={handleNewFromDetail}
                        />
                    </div>

                    {dataList.length > 0 ? (
                        <DataTable
                            data={dataList}
                            columns={columns}
                            onRowClick={(item) => handleRowClick(item, (c) => c)}
                        />
                    ) : (
                        <EmptyState
                            title="No hay compras registradas"
                            description="Comienza a abastecer tu inventario registrando tu primera compra."
                            icon={<HiOutlineShoppingCart size={48} />}
                            action={
                                <SharedButton
                                    title="Nueva Compra"
                                    onClick={handleNewFromDetail}
                                    icon={<HiOutlineDocumentPlus />}
                                />
                            }
                        />
                    )}
                </div>
            )
        },
        {
            key: "detalle",
            label: selectedItem ? `Compra #${selectedItem.idCompra}` : "Nueva Compra",
            icon: selectedItem ? <HiOutlineShoppingCart /> : <HiOutlineDocumentPlus />,
            content: (
                <div className="p-4">
                    <form onSubmit={(e) => handleSubmit(e, (v) => v)} className="space-y-6">
                        <SectionHeader
                            title={selectedItem
                                ? `Detalle de Compra #${selectedItem.idCompra}`
                                : "Registro de Compra"}
                            subtitle={isEditing
                                ? "Ingresa los datos del proveedor y los productos recibidos."
                                : "Consulta la información de la compra realizada."}
                            actions={
                                <div className="flex gap-2">
                                    <SharedButton
                                        title="Volver"
                                        variant="ghost"
                                        onClick={() => setActiveTab("lista")}
                                    />
                                    {isEditing ? (
                                        <SharedButton
                                            type="submit"
                                            title="Guardar Compra"
                                            variant="primary"
                                            icon={<HiOutlineShoppingCart />}
                                        />
                                    ) : (
                                        <SharedButton
                                            title="Actualizar"
                                            onClick={refreshData}
                                            icon={<HiOutlineCalendarDays />}
                                        />
                                    )}
                                </div>
                            }
                        />

                        <ComprasForm
                            values={values}
                            setValues={setValues}
                            isEditing={isEditing}
                            onBranchChange={onBranchChange}
                            onProveedorChange={onProveedorChange}
                        />
                    </form>
                </div>
            )
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dataList, columns, selectedItem, isEditing, values]);

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <div className="mb-4">
                    <Breadcrumb
                        items={[
                            { label: "Home", icon: <FaHome /> },
                            { label: "Inventarios" },
                            { label: "Compras" }
                        ]}
                    />
                </div>

                <div className="flex-1 overflow-visible bg-white rounded-xl shadow-sm border border-gray-200 relative">
                    <Tabs
                        tabs={tabItems}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
            </div>
        </MainLayout>
    );
}

export default ComprasPage;
