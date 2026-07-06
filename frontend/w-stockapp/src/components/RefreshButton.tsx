import React, { useState } from 'react';
import { MdRefresh } from 'react-icons/md';
import { SharedButton } from './SharedButton';

interface RefreshButtonProps {
    onRefresh: () => Promise<void> | void;
    className?: string;
    showText?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ 
    onRefresh, 
    className = "", 
    showText = true,
    variant = 'secondary',
    size
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    const buttonSize = size || (showText ? "sm" : "icon");

    return (
        <SharedButton
            variant={variant}
            size={buttonSize}
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={
                <MdRefresh 
                    className={`w-5 h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} 
                />
            }
            className={`shadow-sm border-slate-200/60 hover:border-slate-300 ${className}`}
            title="Refrescar datos"
        >
            {showText && <span className="ml-1">Refrescar</span>}
        </SharedButton>
    );
};
