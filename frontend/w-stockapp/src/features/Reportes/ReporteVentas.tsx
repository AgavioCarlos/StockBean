import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "../../components/Layouts/MainLayout";
import Breadcrumb from "../../components/Breadcrumb";
import { DataTable, Column } from "../../components/DataTable";
import { BranchFilter } from "../../components/BranchFilter";
import { FaHome } from "react-icons/fa";
import { HiOutlineDocumentChartBar, HiOutlineBanknotes, HiOutlineShoppingCart, HiOutlineCalendarDays } from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import { useAlerts } from "../../hooks/useAlerts";
import { obtenerReporteVentas, obtenerReportePorSucursal } from "./ReporteVentasService";
import type { VentaReporte } from "./reporte_ventas.interface";

export default function ReporteVentas() {
    const { user } = useAuth();
    const { error: showError } = useAlerts();

    const [reporteData, setReporteData] = useState<VentaReporte[]>([]);
    const [loading, setLoading] = useState(false);
    const [idSucursal, setIdSucursal] = useState<number | "">("");

    // ─── Cargar datos ────────────────────────────────────────
    const cargarReporte = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            let data: VentaReporte[];
            if (idSucursal) {
                data = await obtenerReportePorSucursal(Number(idSucursal));
            } else {
                data = await obtenerReporteVentas();
            }
            setReporteData(data);
        } catch (err: any) {
            console.error("Error al cargar reporte:", err);
            showError("Error", err?.message || "Error al cargar el reporte de ventas");
        } finally {
            setLoading(false);
        }
    }, [user, idSucursal, showError]);

    useEffect(() => {
        cargarReporte();
    }, [cargarReporte]);

    // ─── Estadísticas resumen ────────────────────────────────
    const stats = useMemo(() => {
        const totalVentas = reporteData.length;
        const montoTotal = reporteData.reduce((acc, v) => acc + (v.totalVenta || 0), 0);
        const totalProductos = reporteData.reduce((acc, v) => acc + (v.totalProductos || 0), 0);
        const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0;

        return { totalVentas, montoTotal, totalProductos, promedioVenta };
    }, [reporteData]);

    // ─── Formato de fecha ────────────────────────────────────
    const formatFecha = (fechaStr: string) => {
        if (!fechaStr) return "N/A";
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ─── Columnas del DataTable ──────────────────────────────
    const columnas = useMemo<Column<VentaReporte>[]>(() => [
        {
            key: "idVenta",
            label: "# Venta",
            sortable: true,
            render: (val: number) => (
                <span className="font-bold text-indigo-600">#{val}</span>
            ),
        },
        {
            key: "fechaVenta",
            label: "Fecha",
            sortable: true,
            render: (val: string) => (
                <span className="text-gray-600 text-xs font-medium">{formatFecha(val)}</span>
            ),
        },
        {
            key: "sucursal",
            label: "Sucursal",
            sortable: true,
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span className="font-medium text-gray-800">{val}</span>
                </div>
            ),
        },
        {
            key: "cajero",
            label: "Cajero",
            sortable: true,
            render: (val: string) => (
                <span className="text-gray-600">{val || "N/A"}</span>
            ),
        },
        {
            key: "cantidadItems",
            label: "Items",
            sortable: true,
            render: (val: number) => (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                    {val}
                </span>
            ),
        },
        {
            key: "totalProductos",
            label: "Productos",
            sortable: true,
            render: (val: number) => (
                <span className="text-gray-600 font-medium">{val}</span>
            ),
        },
        {
            key: "metodoPago",
            label: "Método Pago",
            sortable: true,
            render: (val: string) => {
                const lower = val?.toLowerCase() || "";
                let color = "bg-gray-100 text-gray-600";
                if (lower.includes("efectivo") || lower.includes("cash")) color = "bg-emerald-50 text-emerald-700";
                if (lower.includes("tarjeta") || lower.includes("card") || lower.includes("créd")) color = "bg-blue-50 text-blue-700";
                if (lower.includes("transferencia") || lower.includes("spei")) color = "bg-purple-50 text-purple-700";
                return (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
                        {val || "N/A"}
                    </span>
                );
            },
        },
        {
            key: "totalVenta",
            label: "Total",
            sortable: true,
            render: (val: number) => (
                <span className="font-bold text-gray-800 text-sm">
                    ${(val || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ),
        },
    ], []);

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50">
                {/* Breadcrumb */}
                <div className="mb-4">
                    <Breadcrumb
                        items={[
                            { label: "Home", icon: <FaHome /> },
                            { label: "Reportes" },
                            { label: "Ventas" },
                        ]}
                    />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Ventas */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Ventas</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <HiOutlineDocumentChartBar className="text-indigo-500" size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">{stats.totalVentas}</div>
                        <span className="text-xs text-gray-400 mt-1">transacciones</span>
                    </div>

                    {/* Monto Total */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Monto Total</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <HiOutlineBanknotes className="text-emerald-500" size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">
                            ${stats.montoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-xs text-gray-400 mt-1">acumulado</span>
                    </div>

                    {/* Productos Vendidos */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Productos Vendidos</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                <HiOutlineShoppingCart className="text-amber-500" size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">{stats.totalProductos}</div>
                        <span className="text-xs text-gray-400 mt-1">unidades</span>
                    </div>

                    {/* Promedio por Venta */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Promedio / Venta</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                <HiOutlineCalendarDays className="text-blue-500" size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">
                            ${stats.promedioVenta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-xs text-gray-400 mt-1">ticket promedio</span>
                    </div>
                </div>

                {/* Filter + Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
                    {/* Branch Filter */}
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <HiOutlineDocumentChartBar className="text-indigo-600" size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-800">Reporte de Ventas</h2>
                                <p className="text-xs text-gray-400">Historial de transacciones por sucursal</p>
                            </div>
                        </div>

                        <BranchFilter
                            onBranchChange={setIdSucursal}
                            value={idSucursal}
                            labelSucursal=""
                            placeholderSucursal="Todas las sucursales"
                        />
                    </div>

                    {/* Loading overlay */}
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-lg transition-all duration-300">
                                <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                                <span className="text-xs font-medium text-slate-500">Cargando reporte…</span>
                            </div>
                        )}
                        <DataTable
                            data={reporteData}
                            columns={columnas}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
