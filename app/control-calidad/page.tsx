import { getRisksAndQA } from '@/lib/trello';
import { Card, cn } from '@/components/ui';
import { ShieldAlert, AlertTriangle, Bug, Gavel, CheckCircle2 } from 'lucide-react';
import QualityHelp from './QualityHelp';
import DetailModal from './DetailModal';

export default async function QualityPage() {
  const items = await getRisksAndQA();

  const openItems = items.filter(i => i.status === 'ABIERTO');
  const resolvedItems = items.filter(i => i.status === 'RESUELTO');

  const getIcon = (type: string) => {
    switch(type) {
      case 'BLOQUEO': return <ShieldAlert size={20} />;
      case 'RIESGO': return <AlertTriangle size={20} />;
      case 'INCIDENCIA': return <Bug size={20} />;
      case 'DECISION': return <Gavel size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  // Mapa de colores para bordes e iconos
  const colorMap: Record<string, string> = {
    red: 'text-rose-600 border-l-rose-500',
    yellow: 'text-amber-500 border-l-amber-500',
    orange: 'text-orange-500 border-l-orange-500',
    green: 'text-emerald-600 border-l-emerald-500',
    blue: 'text-blue-500 border-l-blue-500',
    default: 'text-slate-500 border-l-slate-300'
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        {/* CAMBIO DE TÍTULO AQUÍ */}
        <h2 className="text-2xl font-bold text-slate-900">Riesgos e Incidencias</h2>
        <QualityHelp />
      </div>
      
      {/* SECCIÓN 1: ABIERTOS (Prioridad) */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pendientes de Atención
            <span className="text-sm font-normal text-slate-400 ml-2">({openItems.length})</span>
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
            {openItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                    No hay riesgos ni incidencias abiertas. ¡Buen trabajo!
                </div>
            ) : (
                openItems.map(item => {
                    const colorClass = colorMap[item.color] || colorMap.default;
                    return (
                        <Card key={item.id} className={`p-4 flex items-start gap-4 border-l-4 ${colorClass.split(' ')[1]} shadow-sm hover:shadow-md transition-shadow`}>
                            <div className={`mt-1 ${colorClass.split(' ')[0]}`}>{getIcon(item.type)}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        item.severity === 'ALTA' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {item.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {item.description || "Sin descripción preliminar."}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.type}</span>
                                    <DetailModal item={item} />
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
      </section>

      {/* SECCIÓN 2: RESUELTOS (Histórico) */}
      {resolvedItems.length > 0 && (
          <section className="opacity-75">
            <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center gap-2 mt-8">
                <CheckCircle2 size={18} className="text-emerald-600" /> Resueltos / Mitigados
                <span className="text-sm font-normal text-slate-400 ml-2">({resolvedItems.length})</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {resolvedItems.map(item => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between group hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="text-slate-300 group-hover:text-emerald-500 transition-colors"><CheckCircle2 size={18} /></div>
                            <span className="text-sm font-medium text-slate-500 line-through decoration-slate-300">{item.title}</span>
                        </div>
                        <DetailModal item={item} />
                    </div>
                ))}
            </div>
          </section>
      )}
    </div>
  );
}