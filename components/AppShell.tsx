'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, ListTodo, AlertTriangle, Settings, 
  LogOut, Calendar, ArrowRight, CheckCircle2, FolderOpen, Menu, X 
} from 'lucide-react';
import { cn } from '@/components/ui';

// Tipos para las props que vienen del servidor
interface AppShellProps {
  children: React.ReactNode;
  settings: any;
  metrics: {
    startDate: Date;
    endDate: Date;
    daysElapsed: number;
    daysRemaining: number;
    isFinished: boolean;
  };
}

const NavItem = ({ href, icon: Icon, label, onClick }: { href: string, icon: any, label: string, onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700" 
          : "text-slate-300 hover:text-white hover:bg-slate-800"
      )}
    >
      <Icon size={18} className={isActive ? "text-emerald-400" : "text-slate-400"} />
      <span className={cn("text-sm font-medium", isActive ? "text-white" : "")}>{label}</span>
    </Link>
  );
};

export default function AppShell({ children, settings, metrics }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      {/* 1. SIDEBAR (RESPONSIVO) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-tight">
              CCAD <span className="text-emerald-400">OAR</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2">Portal de Seguimiento</p>
          </div>
          {/* Botón cerrar solo en móvil */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Gestión</p>
          <NavItem href="/" icon={LayoutDashboard} label="Tablero de Control" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/entregables" icon={CheckSquare} label="Entregables" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/actividades" icon={ListTodo} label="Actividades" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/control-calidad" icon={AlertTriangle} label="Riesgos e Incidencias" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/archivos" icon={FolderOpen} label="Archivos" onClick={() => setSidebarOpen(false)} />
          
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8">Sistema</p>
          <NavItem href="/config" icon={Settings} label="Configuración" onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white w-full px-3 py-2 transition-colors">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 flex-shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            
            {/* Botón Menú Móvil */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <Menu size={24} />
            </button>

            <div className="flex flex-col min-w-0">
                <Link href="/" title="Ir al Inicio" className="truncate">
                    <h2 className="text-lg md:text-2xl font-bold text-slate-900 hover:text-emerald-700 transition-colors truncate leading-tight">
                        {settings.projectName || "Proyecto Sin Nombre"}
                    </h2>
                </Link>

                <div className="flex items-center gap-3 mt-1">
                    {metrics.isFinished ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
                            <CheckCircle2 size={10} /> <span className="hidden sm:inline">FINALIZADO</span>
                        </span>
                    ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                            EN EJECUCIÓN
                        </span>
                    )}

                    {/* Info tiempo (Desktop) */}
                    <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-px h-3 bg-slate-300 mx-1"></span>
                        <Calendar size={12} />
                        <span>{formatDate(metrics.startDate)} → {formatDate(metrics.endDate)}</span>
                        <span className="w-px h-3 bg-slate-300 mx-1"></span>
                        <span>Restan <strong>{metrics.daysRemaining}</strong> días</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Admin CCAD</p>
              <p className="text-xs text-slate-500">Punto Focal</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md border-2 border-slate-100">
              AD
            </div>
          </div>
        </header>

        {/* Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
          {children}
        </main>
      </div>
    </div>
  );
}