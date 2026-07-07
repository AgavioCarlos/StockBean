import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { VentaReporte } from '../reporte_ventas.interface';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VentasBarChartProps {
  ventas: VentaReporte[];
  loading?: boolean;
}

const VentasBarChart: React.FC<VentasBarChartProps> = ({ ventas, loading = false }) => {
  const chartData = useMemo(() => {
    // Agrupar ventas por día
    const grouped = ventas.reduce((acc, venta) => {
      // Formatear fecha para agrupar (YYYY-MM-DD)
      const date = new Date(venta.fechaVenta).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
      });
      
      acc[date] = (acc[date] || 0) + venta.totalVenta;
      return acc;
    }, {} as Record<string, number>);

    // Tomar los últimos 7 días con datos o simplemente los que hay
    const labels = Object.keys(grouped).slice(-7);
    const dataValues = labels.map(label => grouped[label]);

    return {
      labels,
      datasets: [
        {
          label: 'Ventas por Día',
          data: dataValues,
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo-500
          hoverBackgroundColor: 'rgba(79, 70, 229, 1)', // Indigo-600
          borderColor: '#6366f1',
          borderWidth: 0,
          borderRadius: 12,
          borderSkipped: false as const,
          barThickness: 32,
        },
      ],
    };
  }, [ventas]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 13, family: "'Inter', sans-serif", weight: 'bold' as const },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `Total: $${context.parsed.y.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(241, 245, 249, 1)',
        },
        border: {
           display: false
        },
        ticks: {
          font: { size: 10, family: "'Inter', sans-serif", weight: 'bold' as const },
          color: '#94a3b8',
          callback: (value: any) => `$${value >= 1000 ? (value/1000) + 'k' : value}`,
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
           display: false
        },
        ticks: {
          font: { size: 10, family: "'Inter', sans-serif", weight: 'bold' as const },
          color: '#94a3b8',
          padding: 10,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-indigo-500">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xs uppercase tracking-widest animate-pulse">Cargando gráfico...</p>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300">
        <p className="font-bold text-sm uppercase tracking-widest">Sin datos para graficar</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[250px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default VentasBarChart;
