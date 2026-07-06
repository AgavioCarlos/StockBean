import React, { ButtonHTMLAttributes } from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'pdf' | 'excel';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface SharedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const SharedButton: React.FC<SharedButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const isEmpresa = !!localStorage.getItem("id_empresa");

    // Base styles
    const baseStyles = `
        inline-flex items-center justify-center font-medium tracking-tight 
        transition-all duration-200 ease-out outline-none whitespace-nowrap
        focus-visible:ring-2 focus-visible:ring-offset-1
        active:scale-[0.98] disabled:active:scale-100
        disabled:opacity-50 disabled:cursor-not-allowed
    `.replace(/\s+/g, ' ').trim();

    // Sizing variants - explicit heights help consistency (Touch-target minimums applied)
    const sizeStyles = {
        sm: 'h-9 px-4 text-xs gap-1.5',
        md: 'h-11 px-6 text-sm gap-2',
        lg: 'h-14 px-8 text-base gap-3',
        icon: 'h-11 w-11 !p-0 shrink-0 flex items-center justify-center'
    };

    // Color/Visual variants with premium aesthetic
    const variantStyles = {
        primary: `
            bg-empresa-primario text-white border-0
            shadow-lg shadow-black/10
            hover:shadow-xl hover:shadow-black/20
            hover:-translate-y-[1px]
            focus-visible:ring-offset-2
            relative overflow-hidden
            before:absolute before:inset-0 before:bg-white/10 before:translate-y-[100%] hover:before:translate-y-0 before:transition-transform before:duration-300 before:pointer-events-none before:ease-out
        `,
        secondary: `
            bg-white text-slate-700 border border-slate-200/80 
            shadow-sm
            hover:bg-slate-50 hover:text-slate-900 shadow-sm
            hover:-translate-y-[1px]
            focus-visible:ring-slate-200 focus-visible:ring-offset-2
        `,
        success: `
            bg-gradient-to-tr from-emerald-600 to-emerald-500
            text-white border-0
            shadow-[0_4px_14px_0_rgb(5,150,105,0.39)] 
            hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:from-emerald-500 hover:to-emerald-400
            hover:-translate-y-[1px]
            focus-visible:ring-emerald-600 focus-visible:ring-offset-2
            relative overflow-hidden
            before:absolute before:inset-0 before:bg-white/10 before:translate-y-[100%] hover:before:translate-y-0 before:transition-transform before:duration-300 before:pointer-events-none before:ease-out
        `,
        danger: `
            bg-rose-50/80 text-rose-600 border border-rose-200/50
            hover:bg-rose-100/80 hover:border-rose-300/50 hover:text-rose-700
            focus-visible:ring-rose-500 focus-visible:ring-offset-2
            hover:-translate-y-[1px] transition-transform
        `,
        outline: `
            bg-transparent border-2 border-slate-200 text-slate-600
            hover:border-slate-800 hover:bg-slate-50 hover:text-slate-900
            focus-visible:ring-slate-300 focus-visible:ring-offset-2
            hover:-translate-y-[1px] transition-all
        `,
        ghost: `
            bg-transparent text-slate-500 border border-transparent
            hover:bg-slate-100 hover:text-slate-900
            focus-visible:ring-slate-200 focus-visible:ring-offset-2
        `,
        pdf: `bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all hover:-translate-y-[1px]`,
        excel: `bg-white text-green-600 border border-green-200 hover:bg-green-50 hover:text-green-700 shadow-sm focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-all hover:-translate-y-[1px]`,
    };

    const combinedStyles = `
        ${baseStyles} 
        ${sizeStyles[size]} 
        ${variantStyles[variant]} 
        rounded-empresa
        ${fullWidth ? 'w-full' : ''} 
        ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
        <button
            className={combinedStyles}
            disabled={disabled}
            {...props}
        >
            {icon && (
                <span className={`flex-shrink-0 flex items-center justify-center ${size === 'icon' ? '' : '-ml-0.5'}`}>
                    {icon}
                </span>
            )}
            {children}
        </button>
    );
};

export interface ExportButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

export const PdfButton: React.FC<ExportButtonProps> = ({ onClick, disabled }) => (
    <SharedButton
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="pdf"
        size="icon"
        title="Exportar a PDF"
        icon={<FaFilePdf size={20} />}
    />
);

export const ExcelButton: React.FC<ExportButtonProps> = ({ onClick, disabled }) => (
    <SharedButton
        type="button"
        onClick={onClick}
        disabled={disabled}
        variant="excel"
        size="icon"
        title="Exportar a Excel"
        icon={<FaFileExcel size={20} />}
    />
);
