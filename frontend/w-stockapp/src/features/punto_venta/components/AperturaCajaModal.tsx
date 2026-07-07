import React, { useState, useEffect } from 'react';
import { useAlerts } from '../../../hooks/useAlerts';
import { obtenerCajas, abrirCaja } from '../CajaService';
import type { ICaja, ITurnoCaja } from '../punto_venta.interface';

interface Props {
    onAperturaExitosa: (turno: ITurnoCaja) => void;
    onClose: () => void;
}

const AperturaCajaModal: React.FC<Props> = ({onAperturaExitosa, onClose }) => {
    const { error: showError, success } = useAlerts();
    const [cajas, setCajas] = useState<ICaja[]>([]);
    const [cargandoCajas, setCargandoCajas] = useState(true);

    const [idCajaForm, setIdCajaForm] = useState<number | ''>('');
    const [montoInicialForm, setMontoInicialForm] = useState<string>('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        const cargarCajas = async () => {
            try {
                const data = await obtenerCajas();
                setCajas(data);
                if (data.length === 1) {
                    setIdCajaForm(data[0].idCaja);
                }
            } catch (error) {
                console.error("Error al cargar cajas:", error);
                showError("Error", "No se pudieron cargar las cajas de la sucursal.");
            } finally {
                setCargandoCajas(false);
            }
        };
        cargarCajas();
    }, [, showError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!idCajaForm) {
            showError("Validación", "Debes seleccionar una caja.");
            return;
        }

        const montoStr = montoInicialForm.replace(/,/g, '');
        const monto = parseFloat(montoStr);
        if (isNaN(monto) || monto < 0) {
            showError("Validación", "El monto inicial debe ser un número válido.");
            return;
        }

        setProcesando(true);
        try {
            const turno = await abrirCaja({
                idCaja: Number(idCajaForm),
                montoInicial: monto
            });
            success("Caja abierta", `Turno iniciado con $${monto.toFixed(2)}`);
            onAperturaExitosa(turno);
        } catch (error: any) {
            showError("Error al abrir caja", error?.message || "Ocurrió un error inesperado.");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50">
                    <h3 className="text-xl font-bold text-gray-800">Apertura de Caja</h3>
                    <p className="text-sm text-gray-500 mt-1">Registra el fondo inicial para comenzar a vender.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="idCajaSelect" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Caja a operar:
                            </label>
                            {cargandoCajas ? (
                                <div className="h-10 animate-pulse bg-gray-100 rounded-xl"></div>
                            ) : (
                                <select
                                    id="idCajaSelect"
                                    name="idCaja"
                                    value={idCajaForm}
                                    onChange={(e) => setIdCajaForm(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full h-11 px-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm text-gray-800"
                                    required
                                >
                                    <option value="" disabled>Selecciona una caja...</option>
                                    {cajas.map(c => (
                                        <option key={c.idCaja} value={c.idCaja}>{c.nombre}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label htmlFor="montoInicialInput" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Fondo Inicial (Efectivo):
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm" aria-hidden="true">$</span>
                                </div>
                                <input
                                    id="montoInicialInput"
                                    name="montoInicial"
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    autoComplete="off"
                                    value={montoInicialForm}
                                    onChange={(e) => setMontoInicialForm(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-11 pl-7 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm text-gray-800"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            disabled={procesando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={procesando || cargandoCajas}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 hover:shadow disabled:opacity-70 flex justify-center items-center"
                        >
                            {procesando ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                "Abrir Caja"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AperturaCajaModal;
