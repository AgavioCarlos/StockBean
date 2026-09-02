import React, { useState, useMemo } from 'react';
import { HiOutlineSearch, HiChevronUp, HiChevronDown, HiOutlineFilter } from 'react-icons/hi';

// Helper para extraer todo el texto de un objeto recursivamente para búsquedas (con protección contra ciclos)
const getSearchableString = (obj: any, visited = new Set(), depth = 0): string => {
  if (obj === null || obj === undefined || depth > 5) return '';
  if (typeof obj === 'object') {
    if (visited.has(obj)) return '';
    visited.add(obj);
    try {
      return Object.values(obj)
        .map(v => getSearchableString(v, visited, depth + 1))
        .join(' ')
        .toLowerCase();
    } catch (e) {
      return '';
    }
  }
  return String(obj).toLowerCase();
};

// Interfaz para definir cada columna
export interface Column<T> {
  key: keyof T;        // La propiedad del objeto (ej. 'nombre')
  label: string;       // El título que verá el usuario
  render?: (value: any, item: T) => React.ReactNode; // Para celdas personalizadas
  valueGetter?: (item: T) => any; // Para extraer valor manual en búsquedas/orden
  sortable?: boolean;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  onRowClick?: (item: T) => void;
  actionContent?: React.ReactNode;
  onFilteredDataChange?: (data: T[]) => void;
}

export const DataTable = <T extends Record<string, any>>({ 
  data, 
  columns, 
  title, 
  onRowClick, 
  actionContent,
  onFilteredDataChange 
}: Props<T>) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = data.filter((row) => {
      const gTerm = globalSearch.toLowerCase();

      const matchesGlobal = !gTerm || getSearchableString(row).includes(gTerm);

      const matchesColumns = columns.every((col, idx) => {
        const filterVal = columnFilters[idx];
        if (!filterVal) return true;
        const cellValue = col?.valueGetter ? col.valueGetter(row) : row[col.key];
        return getSearchableString(cellValue).includes(filterVal.toLowerCase());
      });

      return matchesGlobal && matchesColumns;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const col = columns.find(c => c.key === sortConfig.key);
        const aVal = col?.valueGetter ? col.valueGetter(a) : a[sortConfig.key];
        const bVal = col?.valueGetter ? col.valueGetter(b) : b[sortConfig.key];

        const aStr = getSearchableString(aVal);
        const bStr = getSearchableString(bVal);

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, globalSearch, columnFilters, sortConfig, columns]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, columnFilters, sortConfig, data]);

  React.useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(processedData);
    }
  }, [processedData, onFilteredDataChange]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}

        <div className={`flex flex-col sm:flex-row items-center gap-4 ${!title ? 'w-full justify-between' : 'ml-auto'}`}>
          <div className="relative w-full sm:w-72 md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <HiOutlineSearch className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              placeholder="Buscar registros…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>

          {actionContent && (
            <div className="w-full sm:w-auto shrink-0">
              {actionContent}
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={`${String(col.key)}-${idx}`}
                  className="px-5 py-3 text-left text-[11px] font-bold text-slate-600 uppercase tracking-widest align-top group space-y-2.5"
                >
                  <div
                    className={`flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors w-max select-none ${col.sortable !== false ? '' : 'pointer-events-none'}`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable !== false && (
                      <span className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <HiChevronUp className={`h-[10px] w-[10px] -mb-0.5 ${sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-blue-600 opacity-100' : 'text-slate-400'}`} />
                        <HiChevronDown className={`h-[10px] w-[10px] -mt-0.5 ${sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-blue-600 opacity-100' : 'text-slate-400'}`} />
                      </span>
                    )}
                  </div>

                  {/* <div className="relative w-full max-w-[140px] font-normal">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 pointer-events-none">
                      <HiOutlineFilter className="h-3 w-3" />
                    </span>
                    <input
                      type="text"
                      className="block w-full pl-6 pr-2 py-1.5 border border-transparent rounded-lg text-[11px] bg-slate-100/70 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Filtrar…"
                      value={columnFilters[idx] || ''}
                      onChange={(e) => setColumnFilters({ ...columnFilters, [idx]: e.target.value })}
                    />
                  </div> */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id || row.id_inventario || i}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-200 group ${onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/50'}`}
                >
                  {columns.map((col, idx) => (
                    <td key={`${String(col.key)}-${idx}`} className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600 font-medium align-middle">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-slate-50 p-4 rounded-full text-slate-300">
                      <HiOutlineSearch size={32} />
                    </div>
                    <span className="text-slate-500 font-medium">No se encontraron registros</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info & Pagination */}
      <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <span>Mostrando {paginatedData.length} de {processedData.length} registros (total: {data.length})</span>

        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-400">Página {currentPage} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
