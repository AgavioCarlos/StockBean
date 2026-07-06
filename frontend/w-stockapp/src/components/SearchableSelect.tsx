import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IoIosSearch, IoIosArrowDown, IoIosCloseCircle } from 'react-icons/io';

interface Option {
    value: string | number;
    label: string;
    description?: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    id?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar…",
    label,
    id,
    disabled = false,
    loading = false,
    className = "",
    error
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Encontrar la opción seleccionada (vía == para ser resiliente a discrepancias de tipo)
    const selectedOption = useMemo(() =>
        options.find(opt => opt.value == value),
        [options, value]);

    // Opciones filtradas
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerSearch) ||
            (opt.description && opt.description.toLowerCase().includes(lowerSearch))
        );
    }, [options, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    };

    return (
        <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                    {label}
                </label>
            )}

            <div
                className={`
                    group relative flex items-center justify-between w-full border rounded-xl px-4 py-2.5 transition-all duration-300 cursor-pointer text-sm
                    ${disabled ? 'bg-slate-50 cursor-not-allowed border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}
                    ${isOpen ? 'ring-4 ring-indigo-50 border-indigo-500 shadow-lg' : 'shadow-sm'}
                    ${error ? 'border-red-400 ring-red-50' : ''}
                `}
                onClick={handleToggle}
            >
                <div className="flex items-center gap-3 truncate">
                    {loading && (
                        <div className="shrink-0 w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    )}
                    <span className={`truncate font-medium ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <IoIosArrowDown
                        className={`transition-transform duration-300 text-slate-400 size-4 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
                    />
                </div>
            </div>

            {/* Menú Desplegable */}
            {isOpen && !disabled && (
                <div
                    className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-2 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 origin-top overflow-hidden backdrop-blur-md"
                    style={{ minWidth: '100%' }}
                >
                    {/* Input de Búsqueda */}
                    <div className="relative mb-2">
                        <IoIosSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full pl-10 pr-10 py-2.5 text-sm border-0 border-b border-slate-50 focus:ring-0 focus:border-indigo-500 placeholder-slate-400 transition-all font-medium bg-slate-50/50 rounded-lg"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsOpen(false);
                                if (e.key === 'Enter' && filteredOptions.length > 0) {
                                    handleSelect(filteredOptions[0].value);
                                }
                            }}
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }}
                            >
                                <IoIosCloseCircle size={18} />
                            </button>
                        )}
                    </div>

                    {/* Lista de Opciones */}
                    <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`
                                        flex flex-col px-4 py-2.5 rounded-xl cursor-pointer transition-all group/opt mb-1 last:mb-0
                                        ${value == option.value 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                            : 'hover:bg-slate-50 text-slate-600'}
                                    `}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className="text-sm font-semibold">{option.label}</span>
                                    {option.description && (
                                        <span className={`text-[11px] mt-0.5 line-clamp-1 ${value == option.value ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-slate-50/50 rounded-xl m-1">
                                <span className="text-sm text-slate-400 italic">No hay resultados</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <span className="text-[10px] text-red-500 font-bold px-1 mt-1 animate-bounce">{error}</span>}
        </div>
    );
};
