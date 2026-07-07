import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layouts/MainLayout";
import Tabs from "../../components/Tabs";
import { IoMdList } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { MdDescription, MdCardMembership, MdBlock } from "react-icons/md";
import Breadcrumb from "../../components/Breadcrumb";
import { consultarSuscripcionesAdmin } from "./SuscripcionService";
import { SuscripcionAdmin } from "./suscripcion.interface";
import { Column } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { SuscripcionList } from "./components/SuscripcionList";
import { SuscripcionDetail } from "./components/SuscripcionDetail";
import { useAuth } from "../../hooks/useAuth";
import { RefreshButton } from "../../components/RefreshButton";

export default function Suscripciones() {
    const { isSistem, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [dataList, setDataList] = useState<SuscripcionAdmin[]>([]);
    const [selectedItem, setSelectedItem] = useState<SuscripcionAdmin | null>(null);
    const [activeTab, setActiveTab] = useState("lista");
    const [loading, setLoading] = useState(false);
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await consultarSuscripcionesAdmin();
            if (res) setDataList(res);
        } catch (error) {
            console.error("Error cargando suscripciones", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSistem) loadData();
    }, [isSistem]);

    const handleRowClick = (item: SuscripcionAdmin) => {
        setSelectedItem(item);
        setActiveTab("detalle");
    };

    const columnas = useMemo<Column<SuscripcionAdmin>[]>(() => [
        {
            key: "nombreCompleto",
            label: "Usuario",
            sortable: true,
            render: (_: any, item: SuscripcionAdmin) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{item.nombreCompleto}</span>
                    <span className="text-xs text-gray-400">{item.email}</span>
                </div>
            )
        },
        {
            key: "nombreEmpresa",
            label: "Empresa",
            sortable: true,
            render: (_: any, item: SuscripcionAdmin) => <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">{item.nombreEmpresa}</span>
        },
        {
            key: "planNombre",
            label: "Plan",
            sortable: true,
            render: (val: any) => <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">{val}</span>
        },
        {
            key: "fechaFin",
            label: "Vencimiento",
            sortable: true,
            render: (val: any) => {
                const date = new Date(val);
                const isExpired = date < new Date();
                return <span className={`font-medium ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {date.toLocaleDateString()}
                </span>;
            }
        },
        {
            key: "statusSuscripcion",
            label: "Estado",
            sortable: true,
            valueGetter: (item: SuscripcionAdmin) => item.statusSuscripcion ? "1" : "0",
            render: (status: any) => (
                <StatusBadge
                    status={status as boolean}
                    trueText="Activa"
                    falseText="Inactiva"
                />
            )
        }
    ], []);

    const items = useMemo(() => [
        {
            key: "lista",
            label: "Lista",
            icon: <IoMdList aria-hidden="true" />,
            content: (
                <SuscripcionList
                    data={dataList}
                    columns={columnas}
                    onRowClick={handleRowClick}
                    loading={loading}
                />
            )
        },
        {
            key: "detalle",
            label: "Administración",
            icon: <MdDescription aria-hidden="true" />,
            content: (
                <SuscripcionDetail
                    suscripcion={selectedItem}
                    onUpdate={() => {
                        loadData();
                        // also update selected item from new data
                    }}
                />
            )
        }
    ], [dataList, columnas, selectedItem, loading]);


    if (authLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col h-full bg-slate-50">
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50 pb-6 px-1">
                <div className="flex items-center justify-between">
                    <Breadcrumb
                        showBackButton={true}
                        items={[
                            { label: "Home", icon: <FaHome aria-hidden="true" />, onClick: () => navigate("/dashboard") },
                            { label: "Suscripciones (Admin)", icon: <MdCardMembership aria-hidden="true" /> },
                        ]}
                    />
                    {isSistem && (
                        <div className="mb-6 mr-1">
                            <RefreshButton onRefresh={loadData} />
                        </div>
                    )}
                </div>

                {!isSistem ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col items-center gap-4 text-center px-6 py-16">
                            <div className="p-4 bg-rose-50 rounded-2xl">
                                <MdBlock size={48} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Acceso denegado</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                Solo los usuarios con rol SISTEM pueden administrar suscripciones globales.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-visible bg-white rounded-xl shadow-sm border border-gray-200 relative">
                        <Tabs
                            tabs={items}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
