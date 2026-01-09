import { Card, Semaphore, cn } from '@/components/ui';
import { getActivities, getDeliverables, getRisksAndQA, getDashboardData } from '@/lib/trello';
import { getSettings } from '@/lib/settings';
// IMPORTANTE: Asegurar que ListChecks, Bug y todos los iconos estén aquí
import { CheckCircle2, AlertCircle, TrendingUp, Clock, PlayCircle, Eye, AlertTriangle, ShieldAlert, ListChecks, Bug, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [data, settings, deliverables, activities, risks] = await Promise.all([
    getDashboardData(),
    getSettings(),
    getDeliverables(),
    getActivities(),
    getRisksAndQA()
  ]);

  const today = new Date();
  
  // 1. Línea de tiempo
  const startPoint = { 
      label: 'Orden de Inicio', 
      date: settings.startDate, 
      passed: true, 
      isCompleted: true, 
      progress: 100 
  };

  const milestonePoints = settings.milestones.map((m, index) => {
    const deliverable = deliverables[index];
    const progress = deliverable ? deliverable.progress : 0;
    
    return {
        label: m.name, 
        date: m.date, 
        passed: m.date ? today >= new Date(m.date) : false,
        isCompleted: progress === 100,
        isInProgress: progress > 0 && progress < 100,
        progress: progress
    };
  });

  const timeline = [startPoint, ...milestonePoints].sort((a, b) => {
    if (!a.date) return 1; if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 2. Semáforo Dinámico
  const activeRisks = risks.filter(r => r.type === 'RIESGO' && r.status === 'ABIERTO').length;
  const activeBlocks = risks.filter(r => r.type === 'BLOQUEO' && r.status === 'ABIERTO').length;
  const activeIncidents = risks.filter(r => r.type === 'INCIDENCIA' && r.status === 'ABIERTO').length;

  let statusTitle = "Proyecto en Curso";
  let statusSubtitle = "Ejecución normal";
  
  const issues = [];
  if (activeRisks > 0) issues.push("riesgo");
  if (activeBlocks > 0) issues.push("bloqueos");
  if (activeIncidents > 0) issues.push("incidencias");
  
  if (issues.length > 0) {
      const last = issues.pop();
      const text = issues.length > 0 ? issues.join(", ") + " e " + last : last;
      statusSubtitle = "con " + text;
  }

  const totalDeliverableProgress = deliverables.length > 0 
    ? Math.round(deliverables.reduce((acc, d) => acc + d.progress, 0) / deliverables.length)
    : 0;
    
  if (totalDeliverableProgress === 100) {
      statusTitle = "Proyecto Finalizado";
      statusSubtitle = "100% Completado";
  }

  // 3. Estadísticas Actividades
  const actStats = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'APROBADO').length,
    pending: activities.filter(a => a.status === 'PENDIENTE').length,
    inProgress: activities.filter(a => a.status === 'EN_EJECUCION').length,
    inReview: activities.filter(a => a.status === 'EN_REVISION').length,
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      
      {/* SECCIÓN 1: ESTADO */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h2 className="text-2xl font-bold text-slate-900">Tablero de Control</h2>
            <p className="text-slate-500">Visión estratégica del estado del proyecto.</p>
            </div>
            <Card className="px-6 py-3 bg-white shadow-sm border border-slate-200">
            <Semaphore 
                status={totalDeliverableProgress === 100 ? 'EN_CURSO' : data.status} 
                title={statusTitle} 
                description={statusSubtitle}
            />
            </Card>
        </div>

        <Card className="p-6 overflow-x-auto border-t-4 border-t-slate-600">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Cronograma Contractual</h3>
            <div className="relative flex justify-between items-center min-w-[600px] pb-2 px-4">
            <div className="absolute top-[9px] left-0 w-full h-1 bg-slate-100 -z-10"></div>
            {timeline.map((point, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 relative group flex-1">
                <div className={cn(
                    "w-6 h-6 rounded-full border-4 shadow-sm z-10 transition-all duration-300 flex items-center justify-center",
                    point.isCompleted ? "bg-emerald-500 border-emerald-500 scale-110 text-white" : 
                    point.isInProgress ? "bg-amber-400 border-amber-400" :
                    "bg-white border-slate-300"
                )}>
                    {point.isCompleted && <Check size={12} strokeWidth={4} />}
                </div>
                <div className="text-center flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-slate-700 max-w-[140px] leading-tight">{point.label}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{formatDate(point.date)}</span>
                </div>
                </div>
            ))}
            </div>
        </Card>
      </section>

      {/* SECCIÓN 2: GRID GESTIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA A: ENTREGABLES */}
        <div className="space-y-4 lg:col-span-2">
            <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" /> Avance de Entregables
                </h3>
                <Link href="/entregables" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition-all">
                    Ver detalle <ArrowRight size={14} />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-emerald-600 text-white flex flex-col justify-between col-span-1 md:col-span-1">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase mb-2">Avance Acumulado</p>
                        <span className="text-5xl font-bold tracking-tighter">{totalDeliverableProgress}%</span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-4 opacity-80">Promedio global</p>
                </Card>

                <Card className="p-5 col-span-1 md:col-span-2 bg-white flex flex-col justify-center">
                    <div className="space-y-5">
                        {deliverables.map((d) => (
                            <div key={d.id}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-semibold text-slate-700 truncate pr-4" title={d.name}>{d.name}</span>
                                    <span className="font-bold text-emerald-600">{d.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full rounded-full transition-all" 
                                        style={{ width: `${d.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {deliverables.length === 0 && <p className="text-slate-400 text-sm italic">Sin hitos configurados.</p>}
                    </div>
                </Card>
            </div>
        </div>

        {/* COLUMNA B: RIESGOS */}
        <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" /> Riesgos e Incidencias
                </h3>
                <Link href="/control-calidad" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition-all">
                    Ver bitácora <ArrowRight size={14} />
                </Link>
            </div>

            <div className="flex flex-col gap-3 h-full">
                
                <Card className="p-4 flex items-center justify-between border-l-4 border-l-orange-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Riesgos</p>
                            <p className="text-xs text-slate-500">Potenciales</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 leading-none">
                            {risks.filter(r => r.type === 'RIESGO' && r.status === 'ABIERTO').length}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Activos</span>
                        <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-block border border-emerald-100">
                            {risks.filter(r => r.type === 'RIESGO' && r.status === 'RESUELTO').length} mitigados
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center justify-between border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><ShieldAlert size={20} /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Bloqueos</p>
                            <p className="text-xs text-slate-500">Críticos</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 leading-none">
                            {risks.filter(r => r.type === 'BLOQUEO' && r.status === 'ABIERTO').length}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Activos</span>
                        <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-block border border-emerald-100">
                            {risks.filter(r => r.type === 'BLOQUEO' && r.status === 'RESUELTO').length} resueltos
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Bug size={20} /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Incidencias</p>
                            <p className="text-xs text-slate-500">Reportes</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 leading-none">
                            {risks.filter(r => r.type === 'INCIDENCIA' && r.status === 'ABIERTO').length}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pendientes</span>
                        <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-block border border-emerald-100">
                            {risks.filter(r => r.type === 'INCIDENCIA' && r.status === 'RESUELTO').length} cerradas
                        </div>
                    </div>
                </Card>

            </div>
        </div>
      </div>

      {/* SECCIÓN 3: ACTIVIDADES */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ListChecks className="text-blue-600" /> Avance de Actividades
            </h3>
            <Link href="/actividades" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition-all">
                Ir al tablero <ArrowRight size={14} />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center justify-between bg-blue-50 border border-blue-100">
                <div>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Completadas</p>
                    <p className="text-3xl font-bold text-blue-900">{actStats.completed} <span className="text-lg text-blue-400 font-normal">/ {actStats.total}</span></p>
                </div>
                <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700"><CheckCircle2 size={20} /></div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pendientes</p>
                    <p className="text-2xl font-bold text-slate-700">{actStats.pending}</p>
                </div>
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Clock size={16} /></div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-blue-500 uppercase mb-1">En Ejecución</p>
                    <p className="text-2xl font-bold text-slate-700">{actStats.inProgress}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><PlayCircle size={16} /></div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-amber-500 uppercase mb-1">En Revisión</p>
                    <p className="text-2xl font-bold text-slate-700">{actStats.inReview}</p>
                </div>
                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Eye size={16} /></div>
            </Card>
        </div>
      </section>

    </div>
  );
}