import { getDeliverables } from '@/lib/trello';
import { Card, Badge, cn } from '@/components/ui';
import { FileText, ExternalLink, CheckSquare, ListChecks, Calendar, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react'; // <--- AGREGADO

export default async function DeliverablesPage() {
  const deliverables = await getDeliverables();

  const totalProgressSum = deliverables.reduce((acc, curr) => acc + curr.progress, 0);
  const globalProgress = deliverables.length > 0 ? Math.round(totalProgressSum / deliverables.length) : 0;

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Entregables y Hitos</h2>
            <p className="text-slate-500 mt-1">
              Gestión detallada de productos contractuales y medios de verificación.
            </p>
        </div>
        
        <Card className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg flex items-center justify-between border-none">
            <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" /> Avance Global del Proyecto
                </p>
                <div className="text-4xl font-bold text-white tracking-tight">
                    {globalProgress}%
                </div>
                <p className="text-xs text-slate-400 mt-2">Promedio ponderado de {deliverables.length} hitos</p>
            </div>
            
            <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500" 
                        strokeDasharray={`${globalProgress * 2.26} 226`} 
                        strokeLinecap="round" 
                    />
                </svg>
            </div>
        </Card>
      </div>

      <div className="grid gap-10">
        {deliverables.map(prod => (
          <div key={prod.id} className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{prod.name}</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <Card className="overflow-hidden border-t-4 border-t-emerald-600 shadow-md">
                <div className="bg-slate-50 p-6 border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {prod.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Calendar size={14} />
                        <span>Fecha Límite: {prod.dueDate.toLocaleDateString('es-ES')}</span>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-2xl font-bold text-emerald-700">{prod.progress}%</span>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Avance Hito</p>
                        </div>
                        {prod.status === 'APROBADO' && <Badge variant="success">COMPLETADO</Badge>}
                    </div>
                </div>
                
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div 
                        className="bg-emerald-600 h-full transition-all duration-500 ease-out" 
                        style={{ width: `${prod.progress}%` }}
                    ></div>
                </div>
                </div>

                <div className="p-6 bg-white space-y-4">
                    {prod.cards.length === 0 ? (
                        <p className="text-slate-400 italic text-center py-4">No hay entregables definidos en Trello para este producto.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {prod.cards.map((card) => (
                                <div key={card.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-all hover:shadow-sm bg-slate-50/50">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                                                <FileText size={18} className="text-blue-500 flex-shrink-0" />
                                                {card.title}
                                            </h4>
                                            {card.statusLabel && (
                                                <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full mt-1 inline-block uppercase font-semibold">
                                                    {card.statusLabel}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex-1 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full", card.progress === 100 ? "bg-emerald-500" : "bg-blue-500")}
                                                    style={{ width: `${card.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 w-10 text-right">{card.progress}%</span>
                                            {card.evidenceUrl && (
                                                <a href={card.evidenceUrl} target="_blank" className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-md transition-colors" title="Ver evidencia">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {card.checklist.length > 0 && (
                                        <div className="mt-3 pl-2 sm:pl-7 border-l-2 border-slate-200">
                                            <ul className="space-y-1">
                                                {card.checklist.map((item) => (
                                                    <li key={item.id} className="flex items-start gap-2 text-xs text-slate-600">
                                                        {item.completed ? (
                                                            <CheckSquare size={14} className="text-emerald-500 mt-0.5" />
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 border border-slate-300 rounded mt-0.5 bg-white"></div>
                                                        )}
                                                        <span className={item.completed ? "line-through opacity-70" : ""}>{item.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}