import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import MainLayout from "../../components/Layouts/MainLayout";
import { TbBarcode } from "react-icons/tb";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { FiShoppingCart } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useAlerts } from "../../hooks/useAlerts";
import { buscarPorCodigoBarras, buscarPorNombre, registrarVenta } from "./VentaService";
import type { IProductoBusqueda, ICarritoItem, IVentaRequest, ITurnoCaja } from "./punto_venta.interface";
import { obtenerTurnoActivo } from "./CajaService";
import BusquedaProducto from "./components/BusquedaProducto";
import CarritoVenta from "./components/CarritoVenta";
import PanelPago from "./components/PanelPago";
import AperturaCajaModal from "./components/AperturaCajaModal";
import CierreCajaModal from "./components/CierreCajaModal";
import MovimientoCajaModal from "./components/MovimientoCajaModal";
import { FiChevronDown, FiLogOut, FiDollarSign } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { apiFetch } from "../../services/Api";
import { getPantallasUsuario, savePantallasToLocalStorage } from "../../services/Pantallas";
import { SearchableSelect } from "../../components/SearchableSelect";

function PuntoVenta() {
    const { user } = useAuth();
    const { success, error: showError, warning } = useAlerts();

    // Sucursal
    const [idSucursal, setIdSucursal] = useState<number | "">("");

    const sucursalOptions = useMemo(() => {
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
        const userSucursales = userData.sucursales || [];
        return userSucursales.map((suc: any) => ({
            value: suc.idSucursal,
            label: suc.nombre,
        }));
    }, [idSucursal]);

    // Búsqueda
    const [codigo, setCodigo] = useState("");
    const [resultados, setResultados] = useState<IProductoBusqueda[]>([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Carrito
    const [carrito, setCarrito] = useState<ICarritoItem[]>([]);
    const [procesando, setProcesando] = useState(false);

    // Turno de Caja
    const [turnoActivo, setTurnoActivo] = useState<ITurnoCaja | null>(null);
    const [mostrarModalCaja, setMostrarModalCaja] = useState(false);
    const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
    const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
    const [mostrarMenuCaja, setMostrarMenuCaja] = useState(false);
    const [cargandoTurno, setCargandoTurno] = useState(true);
    const menuCajaRef = useRef<HTMLDivElement>(null);

    // Sucursal Selector State
    const [mostrarSelectorSucursal, setMostrarSelectorSucursal] = useState(false);

    const loadTurnoCaja = async () => {
        try {
            setCargandoTurno(true);
            const turno = await obtenerTurnoActivo();
            if (turno && turno.estado === 'ABIERTO') {
                setTurnoActivo(turno);
            } else {
                setTurnoActivo(null);
                setMostrarModalCaja(true);
            }
        } catch (err) {
            console.error("Error al cargar turno", err);
        } finally {
            setCargandoTurno(false);
        }
    };

    useEffect(() => {
        const cachedSucursal = localStorage.getItem("id_sucursal");
        if (cachedSucursal) {
            const sid = Number(cachedSucursal);
            setIdSucursal(sid);
            loadTurnoCaja();
        } else {
            setMostrarSelectorSucursal(true);
            setCargandoTurno(false);
        }
    }, []);

    const handleSeleccionarSucursal = async (sid: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await apiFetch<any>("/auth/refresh", {
                method: "POST",
                body: JSON.stringify({ token, sucursal: sid })
            });

            if (response && response.success && response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("id_sucursal", sid.toString());
                
                const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
                userData.permisos_crud = response.permisos_crud;
                localStorage.setItem("user_data", JSON.stringify(userData));

                setIdSucursal(sid);
                setMostrarSelectorSucursal(false);
                setCarrito([]); // Clear POS cart on branch switch

                try {
                    const pantallas = await getPantallasUsuario(sid.toString());
                    savePantallasToLocalStorage(pantallas);
                } catch (pe) {
                    console.error("Error reloading screens on branch select", pe);
                }

                await loadTurnoCaja();
            } else {
                showError("Error", "No se pudo actualizar la sesión con la sucursal seleccionada");
            }
        } catch (err: any) {
            console.error("Error al seleccionar sucursal", err);
            showError("Error", err?.message || "Ocurrió un error al configurar la sucursal");
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setMostrarResultados(false);
            }
            if (menuCajaRef.current && !menuCajaRef.current.contains(e.target as Node)) {
                setMostrarMenuCaja(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const ejecutarBusqueda = useCallback(async (texto: string) => {
        // if (!idSucursal || !texto.trim()) {
        //     setResultados([]);
        //     setMostrarResultados(false);
        //     return;
        // }

        setBuscando(true);
        setMostrarResultados(true);

        try {
            const esCodigoBarras = /^\d{4,}$/.test(texto.trim());
            let results: IProductoBusqueda[];

            if (esCodigoBarras) {
                results = await buscarPorCodigoBarras(Number(idSucursal), texto.trim());
            } else {
                results = await buscarPorNombre(texto.trim());
            }

            setResultados(results);

            if (esCodigoBarras && results.length === 1) {
                agregarAlCarrito(results[0]);
                setCodigo("");
                setMostrarResultados(false);
                setResultados([]);
            }
        } catch (err: any) {
            console.error("Error al buscar:", err);
            showError("Error", err?.message || "Error al buscar productos");
        } finally {
            setBuscando(false);
        }
    }, [idSucursal, showError]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCodigo(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.trim().length >= 2) {
            debounceRef.current = setTimeout(() => {
                ejecutarBusqueda(val);
            }, 300);
        } else {
            setResultados([]);
            setMostrarResultados(false);
        }
    }, [ejecutarBusqueda]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && codigo.trim()) {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            ejecutarBusqueda(codigo);
        }
        if (e.key === "Escape") {
            setMostrarResultados(false);
        }
    }, [codigo, ejecutarBusqueda]);

    const agregarAlCarrito = useCallback((producto: IProductoBusqueda) => {
        setCarrito(prev => {
            const existente = prev.find(item => item.idProducto === producto.idProducto);

            if (existente) {
                if (existente.cantidad >= producto.stockDisponible) {
                    warning("Stock insuficiente", `Solo hay ${producto.stockDisponible} unidades de "${producto.nombre}"`);
                    return prev;
                }
                return prev.map(item =>
                    item.idProducto === producto.idProducto
                        ? {
                            ...item,
                            cantidad: item.cantidad + 1,
                            subtotal: (item.cantidad + 1) * item.precioUnitario - item.descuento,
                        }
                        : item
                );
            }

            // Nuevo producto
            return [...prev, {
                idProducto: producto.idProducto,
                nombre: producto.nombre,
                codigoBarras: producto.codigoBarras,
                precioUnitario: producto.precioVenta,
                cantidad: 1,
                descuento: 0,
                subtotal: producto.precioVenta,
                stockDisponible: producto.stockDisponible,
                unidad: producto.unidad,
                imagenUrl: producto.imagenUrl,
            }];
        });

        setMostrarResultados(false);
        setCodigo("");
        inputRef.current?.focus();
    }, [warning]);

    const actualizarCantidad = useCallback((idProducto: number, delta: number) => {
        setCarrito(prev => prev.map(item => {
            if (item.idProducto === idProducto) {
                const nuevaCantidad = Math.max(1, Math.min(item.cantidad + delta, item.stockDisponible));
                if (item.cantidad + delta > item.stockDisponible) {
                    warning("Stock insuficiente", `Solo hay ${item.stockDisponible} unidades disponibles`);
                }
                return {
                    ...item,
                    cantidad: nuevaCantidad,
                    subtotal: nuevaCantidad * item.precioUnitario - item.descuento,
                };
            }
            return item;
        }));
    }, [warning]);

    const eliminarDelCarrito = useCallback((idProducto: number) => {
        setCarrito(prev => prev.filter(item => item.idProducto !== idProducto));
    }, []);

    const totalAmount = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    const handlePagar = useCallback(async (idMetodoPago: number) => {
        if (!turnoActivo) {
            warning("Caja Cerrada", "Debes abrir una caja antes de registrar ventas.");
            setMostrarModalCaja(true);
            return;
        }
        // if (!idSucursal) {
        //     warning("Atención", "Selecciona una sucursal antes de pagar.");
        //     return;
        // }
        if (carrito.length === 0) {
            warning("Atención", "Agrega productos al carrito antes de pagar.");
            return;
        }

        setProcesando(true);

        const request: IVentaRequest = {
            // idSucursal: Number(idSucursal),
            idMetodoPago,
            items: carrito.map(item => ({
                idProducto: item.idProducto,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                descuento: item.descuento,
                subtotal: item.subtotal,
            })),
        };

        try {
            const venta = await registrarVenta(request);
            success("¡Venta registrada!", `Venta #${venta.idVenta} por $${totalAmount.toFixed(2)} registrada exitosamente.`);
            setCarrito([]);
            setCodigo("");
            inputRef.current?.focus();
        } catch (err: any) {
            console.error("Error al registrar venta:", err);
            showError("Error al registrar venta", err?.message || "Ocurrió un error inesperado");
        } finally {
            setProcesando(false);
        }
    }, [idSucursal, carrito, totalAmount, success, showError, warning]);

    return (
        <MainLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-56 shrink-0">
                        <SearchableSelect
                            options={sucursalOptions}
                            value={idSucursal}
                            onChange={(val) => handleSeleccionarSucursal(Number(val))}
                            placeholder="Seleccionar Sucursal"
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-4 py-3 min-w-48 relative" ref={menuCajaRef}>
                        {turnoActivo ? (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                    <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-0.5">Caja Abierta</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        Turno #{turnoActivo.idTurno}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setMostrarMenuCaja(!mostrarMenuCaja)}
                                    className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiChevronDown size={20} className={`transform transition-transform ${mostrarMenuCaja ? 'rotate-180' : ''}`} />
                                </button>

                                {mostrarMenuCaja && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={() => {
                                                setMostrarModalMovimiento(true);
                                                setMostrarMenuCaja(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiDollarSign size={16} /> Entradas / Retiros
                                        </button>
                                        <div className="h-px bg-gray-100 my-1 mx-4"></div>
                                        <button
                                            onClick={() => {
                                                setMostrarModalCierre(true);
                                                setMostrarMenuCaja(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <FiLogOut size={16} /> Corte de Caja (Z)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1">
                                {/* <BranchFilter
                                    onBranchChange={setIdSucursal}
                                    value={idSucursal}
                                    labelSucursal=""
                                    placeholderSucursal="Sucursal..."
                                /> */}
                            </div>
                        )}

                        {!turnoActivo && (
                            <button
                                onClick={() => setMostrarModalCaja(true)}
                                className="ml-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm rounded-lg transition-colors whitespace-nowrap"
                            >
                                Abrir Caja
                            </button>
                        )}
                    </div>

                    <div ref={searchRef} className="flex-1 relative">
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-500 flex-shrink-0">
                                <TbBarcode size={22} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={codigo}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => { if (resultados.length > 0) setMostrarResultados(true); }}
                                placeholder={"Escanear código de barras o buscar por nombre..."}
                                // disabled={!idSucursal}
                                className="w-full text-base bg-transparent border-none outline-none placeholder-gray-300 font-medium text-gray-700 disabled:cursor-not-allowed"
                                autoFocus
                            />
                            <HiOutlineMagnifyingGlass className="text-gray-300 flex-shrink-0" size={20} />
                        </div>
                        <BusquedaProducto
                            resultados={resultados}
                            visible={mostrarResultados}
                            onSelect={agregarAlCarrito}
                            buscando={buscando}
                        />
                    </div>

                    <div className="sm:hidden bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiShoppingCart className="text-indigo-500" size={18} />
                            <span className="text-sm font-medium text-gray-600">
                                {carrito.length} productos
                            </span>
                        </div>
                        <span className="font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                    <div className="lg:col-span-8 h-full min-h-0">
                        <CarritoVenta
                            items={carrito}
                            onUpdateQuantity={actualizarCantidad}
                            onRemoveItem={eliminarDelCarrito}
                        />
                    </div>
                    <div className="lg:col-span-4 h-full min-h-0">
                        <PanelPago
                            items={carrito}
                            totalAmount={totalAmount}
                            onPagar={handlePagar}
                            procesando={procesando}
                        />
                    </div>
                </div>
            </div>
            {mostrarModalCaja && (
                <AperturaCajaModal
                    onClose={() => setMostrarModalCaja(false)}
                    onAperturaExitosa={(turno) => {
                        setTurnoActivo(turno);
                        setMostrarModalCaja(false);
                    }}
                />
            )}

            {/* Modal de Cierre de Caja */}
            {mostrarModalCierre && turnoActivo && (
                <CierreCajaModal
                    turnoActivo={turnoActivo}
                    onClose={() => setMostrarModalCierre(false)}
                    onCierreExitoso={(turno) => {
                        setTurnoActivo(null); // Caja ya no está activa localmente
                        setMostrarModalCierre(false);
                        success("Turno Cerrado", "La caja ha sido cerrada y ya no es posible cobrar.");
                        setCarrito([]); // Limpiar carrito de ventas en curso
                        setCodigo("");
                    }}
                />
            )}

            {/* Modal de Movimientos (Arqueos) */}
            {mostrarModalMovimiento && turnoActivo && (
                <MovimientoCajaModal
                    turnoActivo={turnoActivo}
                    onClose={() => setMostrarModalMovimiento(false)}
                />
            )}

            {mostrarSelectorSucursal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-12 h-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <FaBuilding className="text-indigo-600 animate-pulse" size={24} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-1 font-sans">Seleccionar Sucursal</h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium font-sans">Elige la sucursal para operar la caja</p>
                        
                        <div className="space-y-2">
                            {(() => {
                                const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
                                const userSucursales = userData.sucursales || [];
                                if (userSucursales.length === 0) {
                                    return (
                                        <div className="text-center py-4 text-slate-400 font-bold font-sans text-sm">
                                            No tienes sucursales asignadas.
                                        </div>
                                    );
                                }
                                return userSucursales.map((suc: any) => (
                                    <button
                                        key={suc.idSucursal}
                                        onClick={() => handleSeleccionarSucursal(suc.idSucursal)}
                                        className="w-full text-center py-3 px-4 border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/10 rounded-xl transition-all duration-200 font-bold text-slate-700 hover:text-indigo-600 text-sm font-sans outline-none focus:border-indigo-600 focus:bg-indigo-50/10"
                                    >
                                        {suc.nombre}
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default PuntoVenta;