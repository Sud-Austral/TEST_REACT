'use client';

import { useState } from 'react';
import { Activity } from '@/lib/trello';
import { Card, cn } from '@/components/ui';
import ActivityHelp from './ActivityHelp';
// Usamos iconos estándar para evitar errores de importación
import { Columns, Calendar } from 'lucide-react';

const colorMap: Record<string, { border: string, bg: string, text: string, badge: string, bar: string }> = {
    blue:   { border: 'border-l-blue-500',   bg: 'hover:bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500' },
    green:  { border: 'border-l-emerald-500', bg: 'hover:bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
    orange: { border: 'border-l-orange-500', bg: 'hover:bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
    red:    { border: 'border-l-rose-500',   bg: 'hover:bg-rose-50',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500' },
    purple: { border: 'border-l-purple-500', bg: 'hover:bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-500' },
    yellow: { border: 'border-l-yellow-500', bg: 'hover:bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
    default: { border: 'border-l-slate-300', bg: 'hover:bg-slate-50',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' }
};

export default function ActivityViews({ activities, baseTime }: { activities: Activity[], baseTime: number }) {
  const [view, setView] = useState<'KANBAN' | 'GANTT'>('GANTT');
  const [showToday, setShowToday] = useState(true);
  
  const safeBaseTime = baseTime || new Date().getTime();

  // --- KANBAN CONFIG ---
  const columns = [
    { id: 'PENDIENTE', label: 'Pendiente', color: 'border-l-slate-300' },
    { id: 'EN_EJECUCION', label: 'En Ejecución', color: 'border-l-blue-500' },
    { id: 'EN_REVISION', label: 'En Revisión', color: 'border-l-amber-500' },
    { id: 'APROBADO', label: 'Aprobado', color: 'border-l-emerald-500' },
  ];

  // --- GANTT LOGIC ---
  const groupedActivities = activities.reduce((acc, act) => {
    const phase = act.phase || 'General';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  const allDates = activities.flatMap(a => {
    const d = [];
    if (a.startDate) d.push(new Date(a.startDate).getTime());
    if (a.dueDate) d.push(new Date(a.dueDate).getTime());
    return d;
  }).filter(t => !isNaN(t));
  
  const minTime = allDates.length > 0 ? Math.min(...allDates) : safeBaseTime;
  const maxTime = allDates.length > 0 ? Math.max(...allDates) : safeBaseTime;
  
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);
  
  const totalDuration = Math.max(maxDate.getTime() - minDate.getTime(), 1000 * 60 * 60 * 24 * 10); 
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

  const months = [];
  let currentMonth = new Date(minDate);
  currentMonth.setDate(1); 
  while (currentMonth <= maxDate) {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthStart = Math.max(currentMonth.getTime(), minDate.getTime());
    const monthEnd = Math.min(nextMonth.getTime(), maxDate.getTime());
    if (monthEnd > monthStart) {
        const widthPercent = ((monthEnd - monthStart) / totalDuration) * 100;
        months.push({ label: currentMonth.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }), width: widthPercent });
    }
    currentMonth = nextMonth;
  }

  const todayPercent = ((safeBaseTime - minDate.getTime()) / totalDuration) * 100;
  const showTodayLine = showToday && todayPercent >= 0 && todayPercent <= 100;

  const safeDateStr = (dateVal: Date | null) => {
      if(!dateVal) return '-';
      try { return new Date(dateVal).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }); } catch { return '-'; }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 pb-4 gap-4">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">Actividades</h2>
            <ActivityHelp />
        </div>
        
        <div className="flex items-center gap-4">
            {view === 'GANTT' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 select-none">
                    <input type="checkbox" checked={showToday} onChange={(e) => setShowToday(e.target.checked)} className="rounded border-slate-300 text-blue-600 h-4 w-4" />
                    <span className="hidden sm:inline">Mostrar Hoy</span>
                    <span className="sm:hidden">Hoy</span>
                </label>
            )}
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setView('KANBAN')} className={cn("px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all", view === 'KANBAN' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                    <Columns size={16} /> <span className="hidden sm:inline">Tablero</span>
                </button>
                <button onClick={() => setView('GANTT')} className={cn("px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all", view === 'GANTT' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                    <Calendar size={16} /> <span className="hidden sm:inline">Gantt</span>
                </button>
            </div>
        </div>
      </div>

      {view === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full pb-4">
            {columns.map(col => {
            const items = activities.filter(a => a.status === col.id);
            return (
                <div key={col.id} className="flex flex-col h-full bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 shadow-sm">
                <div className={`p-2 font-bold text-sm text-slate-700 border-b border-slate-200 mb-3 flex justify-between items-center`}>
                    {col.label}
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm">{items.length}</span>
                </div>
                <div className="flex-1 space-y-3">
                    {items.map(act => {
                        const styles = colorMap[act.phaseColor] || colorMap.default;
                        return (
                            <Card key={act.id} className={cn("p-3 border-l-[4px] shadow-sm cursor-pointer group", styles.border, styles.bg)}>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", styles.badge)}>{act.phase}</span>
                                    {act.module && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-500">{act.module}</span>}
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight mb-3 group-hover:text-black">{act.title}</p>
                                {act.dueDate && <div className="flex items-center gap-1.5 pt-2 border-t border-dashed border-slate-200"><span className="text-[10px] font-medium text-slate-400 uppercase">Vence</span><span className={cn("text-xs font-bold", styles.text)} suppressHydrationWarning>{new Date(act.dueDate).toLocaleDateString('es-ES')}</span></div>}
                            </Card>
                        );
                    })}
                </div>
                </div>
            )
            })}
        </div>
      )}

      {view === 'GANTT' && (
        <Card className="overflow-hidden border border-slate-200 shadow-md flex flex-col h-[600px]">
            <div className="overflow-auto relative h-full">
                <div className="min-w-[800px] pb-4">
                    
                    {/* HEADER STICKY (ENCABEZADOS) */}
                    <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-40 shadow-sm">
                        <div className="w-[220px] flex-shrink-0 p-3 border-r border-slate-200 bg-slate-50 sticky left-0 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Actividad</div>
                        <div className="w-[80px] flex-shrink-0 p-3 text-center border-r border-slate-200 bg-slate-50 z-20">Inicio</div>
                        <div className="w-[80px] flex-shrink-0 p-3 text-center border-r border-slate-200 bg-slate-50 z-20">Fin</div>
                        <div className="w-[100px] flex-shrink-0 p-3 text-center border-r border-slate-200 bg-slate-50 z-20">Estado</div>
                        
                        {/* Línea de Tiempo (Header) */}
                        <div className="flex-1 relative min-w-[400px]">
                            <div className="absolute inset-0 flex h-full">
                                {months.map((m, idx) => (
                                    <div key={idx} className="h-full border-l border-slate-200 flex items-center justify-center text-[10px] text-slate-400 bg-slate-50" style={{ width: `${m.width}%` }}>
                                        <span className="truncate px-1">{m.label}</span>
                                    </div>
                                ))}
                            </div>
                            {showTodayLine && <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-30 flex flex-col items-center" style={{ left: `${todayPercent}%` }}><div className="bg-red-500 text-white text-[8px] px-1 rounded-b font-bold">HOY</div></div>}
                        </div>
                    </div>

                    {/* CUERPO DEL GANTT */}
                    <div className="space-y-0">
                        {activities.length === 0 && <p className="text-sm text-slate-400 italic p-8 text-center">No hay actividades para mostrar.</p>}
                        
                        {Object.entries(groupedActivities).map(([phase, phaseActs]) => (
                            <div key={phase} className="border-b border-slate-100 last:border-0">
                                
                                {/* SEPARADOR DE FASE (PRODUCTO) - AHORA FIJO COMO UNA FILA */}
                                <div className="flex border-b border-slate-200 bg-slate-100/50">
                                    <div className="w-[220px] flex-shrink-0 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 sticky left-0 z-30 bg-slate-100 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className={`w-3 h-3 rounded-full ${colorMap[phaseActs[0].phaseColor]?.bar.replace('bg-', 'bg-') || 'bg-slate-400'}`}></div>
                                        <span className="truncate">{phase}</span>
                                    </div>
                                    {/* Relleno visual para el resto de la fila del separador */}
                                    <div className="flex-1 bg-slate-50/30"></div>
                                </div>

                                {phaseActs.map(act => {
                                    const styles = colorMap[act.phaseColor] || colorMap.default;
                                    const startTs = act.startDate ? new Date(act.startDate).getTime() : (act.dueDate ? new Date(act.dueDate).getTime() : safeBaseTime);
                                    const endTs = act.dueDate ? new Date(act.dueDate).getTime() : startTs;
                                    const duration = Math.max(endTs - startTs, 1000 * 60 * 60 * 24);
                                    const offset = startTs - minDate.getTime();
                                    const leftPercent = Math.max(0, (offset / totalDuration) * 100);
                                    const widthPercent = Math.min(100, (duration / totalDuration) * 100);
                                    const statusLabel = { 'PENDIENTE': 'Pendiente', 'EN_EJECUCION': 'En Ejecución', 'EN_REVISION': 'En Revisión', 'APROBADO': 'Finalizado' }[act.status];
                                    const statusBadge = { 'PENDIENTE': 'bg-slate-100 text-slate-500', 'EN_EJECUCION': 'bg-blue-100 text-blue-700', 'EN_REVISION': 'bg-amber-100 text-amber-700', 'APROBADO': 'bg-emerald-100 text-emerald-700' }[act.status];

                                    return (
                                        <div key={act.id} className="flex border-b border-slate-50 hover:bg-slate-50/80 transition-colors group h-10 items-center">
                                            {/* Columna Fija Nombre (Sticky) */}
                                            <div className="w-[220px] flex-shrink-0 px-3 truncate text-sm text-slate-700 font-medium border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" title={act.title}>
                                                {act.title}
                                            </div>
                                            
                                            <div className="w-[80px] flex-shrink-0 px-1 text-center text-xs text-slate-500 border-r border-slate-100" suppressHydrationWarning>{safeDateStr(act.startDate || act.dueDate)}</div>
                                            <div className="w-[80px] flex-shrink-0 px-1 text-center text-xs text-slate-500 border-r border-slate-100" suppressHydrationWarning>{safeDateStr(act.dueDate)}</div>
                                            <div className="w-[100px] flex-shrink-0 px-2 text-center border-r border-slate-100"><span className={cn("text-[9px] px-2 py-0.5 rounded font-bold uppercase", statusBadge)}>{statusLabel}</span></div>
                                            
                                            <div className="flex-1 relative h-full min-w-[400px]">
                                                {showTodayLine && <div className="absolute top-0 bottom-0 border-l-2 border-red-500/30 z-0 pointer-events-none" style={{ left: `${todayPercent}%` }}></div>}
                                                <div className={cn("absolute top-2.5 h-5 rounded-md shadow-sm transition-all hover:brightness-110 z-10 cursor-help", styles.bar)} style={{ left: `${leftPercent}%`, width: `${Math.max(0.5, widthPercent)}%` }} title={`${act.title}`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
      )}
    </div>
  );
}