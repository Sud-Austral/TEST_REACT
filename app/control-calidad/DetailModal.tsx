'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { RiskOrIncident } from '@/lib/trello';

export default function DetailModal({ item }: { item: RiskOrIncident }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
      >
        Ver Detalle
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-start sticky top-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        item.severity === 'ALTA' ? 'bg-red-100 text-red-700 border-red-200' : 
                        item.severity === 'MEDIA' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                        'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                        {item.type} • {item.severity}
                    </span>
                    {item.date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Descripción del Caso</h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                        {item.description || "Sin descripción detallada disponible en Trello."}
                    </div>
                </div>
                {/* Enlace externo eliminado según solicitud */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}