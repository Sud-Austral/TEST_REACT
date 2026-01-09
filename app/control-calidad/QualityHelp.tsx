'use client';

import { useState } from 'react';
import { HelpCircle, X, Calendar } from 'lucide-react';

export default function QualityHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-blue-600 transition-colors p-1 align-middle"
        title="Guía de Gestión"
      >
        <HelpCircle size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-8 left-0 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-slate-800 text-sm">Gestión de Estados</h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600">
              <p>El portal sincroniza el estado automáticamente desde Trello:</p>

              <div className="flex items-start gap-3 bg-red-50 p-2 rounded border border-red-100">
                <div className="font-bold text-red-600 mt-0.5">ABIERTO</div>
                <p>Estado por defecto si la tarjeta NO tiene fecha de vencimiento o si la fecha es futura.</p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-2 rounded border border-emerald-100">
                <div className="font-bold text-emerald-600 mt-0.5">RESUELTO</div>
                <div>
                    <p className="mb-1">Para cerrar o resolver un ítem:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Abre la tarjeta en Trello.</li>
                        <li>Asigna una <strong>Fecha de Vencimiento</strong> que sea <span className="font-bold">hoy o anterior</span>.</li>
                        <li>El sistema detectará que la fecha ya pasó y lo marcará como resuelto.</li>
                    </ol>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}