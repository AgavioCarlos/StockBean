import { useState, useMemo, type ChangeEvent } from "react";
import { consultarProductos, crearProducto, actualizarProducto } from "./ProductosService";
import { Productos } from "./producto.interface";
import { IoMdAddCircle, IoMdList, IoIosSave } from "react-icons/io";
import { MdDescription } from "react-icons/md";
import { useCRUD } from "../../hooks/useCRUD";
import { useLOVs } from "../../hooks/useLOVs";
import Tabs from "../../components/Tabs";
import { DataTable, type Column } from "../../components/DataTable";
import { SharedButton, PdfButton, ExcelButton } from "../../components/SharedButton";
import { StatusBadge } from "../../components/StatusBadge";
import StatusFilter from "../../components/StatusFilter";
import { RefreshButton } from "../../components/RefreshButton";
import { PageContainer, SectionHeader, LoadingOverlay, EmptyState } from "../../components/ui";
import { ProductosForm } from "./components/ProductosForm";

function ProductosPage() {
    const [filtroEstado, setFiltroEstado] = useState(true);
    const [imagenUrlPreview, setImagenUrlPreview] = useState("");
    const { data: lovs, loading: loadingLovs } = useLOVs(["categorias", "marcas", "unidades", "productos"]);

    interface LovOption {
        value: string | number;
        label: string;
        [key: string]: any;
    }

    const lovOptions = useMemo(() => ({
        categorias: (lovs.categorias || []).map((c: any): LovOption => ({
            value: c.idCategoria ?? c.id,
            label: c.nombre
        })),
        marcas: (lovs.marcas || []).map((m: any): LovOption => ({
            value: m.idMarca ?? m.id,
            label: m.nombre
        })),
        unidades: (lovs.unidades || []).map((u: any): LovOption => ({
            value: u.idUnidad ?? u.id,
            label: u.nombre
        })),
        productos: (lovs.productos || []).map((p: any): LovOption => ({
            ...p,
            value: p.idProducto ?? p.id,
            label: p.nombre
        }))
    }), [lovs]);

    const crud = useCRUD<Productos>({
        fetchData: consultarProductos,
        createData: crearProducto as any,
        updateData: actualizarProducto as any,
        deleteData: (id, _, status) => actualizarProducto(id, { status } as any),
        getId: (p) => p.id_producto,
        initialFormValues: {
            nombre: "",
            descripcion: "",
            idCategoria: 0,
            idUnidad: 0,
            idMarca: 0,
            codigoBarras: "",
            imagenUrl: "",
            status: true
        }
    });

    const {
        dataList,
        loading,
        activeTab,
        setActiveTab,
        selectedItem,
        isEditing,
        setIsEditing,
        values,
        setValues,
        handleChange,
        refreshData,
        handleDeleteOrRestore
    } = crud;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagenUrlPreview(url);
            setValues({ ...values, imagenUrl: url });
        }
    };

    const rowDataFiltrada = useMemo(() =>
        dataList.filter(p => (p.status === filtroEstado)),
        [dataList, filtroEstado]
    );

    const columnDefs = useMemo<Column<Productos>[]>(() => [
        { key: "nombre", label: "Nombre", sortable: true },
        { key: "descripcion", label: "Descripción" },
        {
            key: "categoria",
            label: "Categoría",
            render: (_, item) => {
                const idCat = item.categoria?.idCategoria ?? item.idCategoria;
                const cat = lovOptions.categorias.find((c: { value: string | number }) => c.value === idCat);
                return <span className="text-slate-600 italic font-medium">{cat?.label || "Sin Categoría"}</span>;
            }
        },
        {
            key: "marca",
            label: "Marca",
            render: (_, item) => {
                const idMarca = item.marca?.idMarca ?? item.idMarca;
                const m = lovOptions.marcas.find((mar: { value: string | number }) => mar.value === idMarca);
                return <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500">{m?.label || "—"}</span>;
            }
        },
        {
            key: "status",
            label: "Estado",
            sortable: true,
            render: (_, item) => (
                <StatusBadge status={item.status as boolean} />
            )
        }
    ], [lovOptions]);

    return (
        <PageContainer
            breadcrumbs={[{ label: "Catálogos", onClick: () => { } }, { label: "Productos" }]}
        >
            <div className="bg-white rounded-card shadow-card border border-empresa overflow-hidden flex flex-col h-[calc(100vh-180px)]">
                <Tabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={[
                        {
                            key: "lista",
                            label: "Productos",
                            icon: <IoMdList />,
                            content: (
                                <div className="p-6 pt-2 flex flex-col h-full relative">
                                    <SectionHeader
                                        title="Inventario"
                                        subtitle={`${rowDataFiltrada.length} productos registrados.`}
                                        className="border-none mb-4"
                                        actions={
                                            <div className="flex items-center gap-2">
                                                <StatusFilter status={filtroEstado} onChange={setFiltroEstado} />
                                                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                                <RefreshButton onRefresh={refreshData} showText={false} />
                                                <PdfButton onClick={() => { }} />
                                                <ExcelButton onClick={() => { }} />
                                                <SharedButton onClick={crud.newFromDetail} variant="primary" icon={<IoMdAddCircle size={20} />}>
                                                    Agregar
                                                </SharedButton>
                                            </div>
                                        }
                                    />

                                    <div className="flex-1 overflow-hidden relative">
                                        {loading && <LoadingOverlay message="Cargando productos..." />}

                                        {!loading && rowDataFiltrada.length === 0 ? (
                                            <EmptyState
                                                icon={<IoMdAddCircle size={32} />}
                                                title="No se encontraron productos"
                                                description={filtroEstado ? "No hay productos activos registrados todavía." : "No hay productos inactivos."}
                                                action={filtroEstado ? <SharedButton variant="primary" onClick={crud.newFromDetail}>Agregar el primero</SharedButton> : undefined}
                                            />
                                        ) : (
                                            <DataTable
                                                data={rowDataFiltrada}
                                                columns={columnDefs}
                                                onRowClick={(p) => {
                                                    setImagenUrlPreview(p.imagenUrl || "");
                                                    crud.handleRowClick(p, (item) => ({
                                                        ...item,
                                                        idCategoria: item.categoria?.idCategoria ?? item.idCategoria,
                                                        idUnidad: item.unidad?.idUnidad ?? item.idUnidad,
                                                        idMarca: item.marca?.idMarca ?? item.idMarca
                                                    }));
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "detalle",
                            label: selectedItem ? "Detalle" : "Nuevo",
                            icon: <MdDescription />,
                            content: (
                                <form
                                    className="p-6 pt-2 flex flex-col h-full bg-white relative"
                                    onSubmit={(e) => crud.handleSubmit(e, (vals) => vals)}
                                >
                                    <SectionHeader
                                        title={selectedItem ? `Producto: ${selectedItem.nombre}` : "Registrar Producto"}
                                        className="border-none mb-6"
                                        actions={
                                            <div className="flex items-center gap-3">
                                                {selectedItem && (
                                                    <>
                                                        {!isEditing && (
                                                            <SharedButton
                                                                variant="secondary"
                                                                onClick={() => setIsEditing(true)}
                                                            >
                                                                Editar
                                                            </SharedButton>
                                                        )}
                                                        <SharedButton
                                                            variant={selectedItem.status ? "danger" : "success"}
                                                            onClick={() => handleDeleteOrRestore(selectedItem)}
                                                            title={selectedItem.status ? "Desactivar" : "Reactivar"}
                                                        >
                                                            {selectedItem.status ? "Desactivar" : "Reactivar"}
                                                        </SharedButton>
                                                    </>
                                                )}

                                                {isEditing && (
                                                    <SharedButton
                                                        type="submit"
                                                        variant="success"
                                                        icon={<IoIosSave size={20} />}
                                                    >
                                                        Guardar Cambios
                                                    </SharedButton>
                                                )}
                                            </div>
                                        }
                                    />

                                    <div className="flex-1 overflow-auto">
                                        <ProductosForm
                                            values={values}
                                            handleChange={handleChange}
                                            setValues={setValues}
                                            isEditing={isEditing}
                                            loadingLovs={loadingLovs}
                                            lovOptions={lovOptions}
                                            imagenUrl={imagenUrlPreview}
                                            onImageChange={handleImageChange}
                                        />
                                    </div>
                                </form>
                            )
                        }
                    ]}
                />
            </div>
        </PageContainer>
    );
}

export default ProductosPage;
