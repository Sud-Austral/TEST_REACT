import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-lg border border-slate-200 shadow-sm", className)}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'default' }) => {
  const styles = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    neutral: "bg-gray-100 text-gray-600"
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
};

// SEMÁFORO ACTUALIZADO: Acepta título y descripción personalizados
export const Semaphore = ({ 
  status, 
  title, 
  description 
}: { 
  status: 'EN_CURSO' | 'EN_RIESGO' | 'RETRASADO',
  title?: string,
  description?: string
}) => {
  
  const colors = {
    'EN_CURSO': 'bg-emerald-500',
    'EN_RIESGO': 'bg-amber-500', 
    'RETRASADO': 'bg-rose-500',
  };

  const colorClass = colors[status] || colors['EN_CURSO'];
  
  // Usamos los textos que vienen de fuera (page.tsx)
  const displayTitle = title || (status === 'EN_CURSO' ? 'Proyecto en Curso' : 'Atención Requerida');
  const displayDesc = description || (status === 'EN_CURSO' ? 'Ejecución normal' : 'Verificar alertas');

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-4 w-4 flex-shrink-0">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", colorClass)}></span>
        <span className={cn("relative inline-flex rounded-full h-4 w-4", colorClass)}></span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 leading-tight">{displayTitle}</p>
        <p className="text-xs text-slate-500 leading-tight capitalize">{displayDesc}</p>
      </div>
    </div>
  );
};