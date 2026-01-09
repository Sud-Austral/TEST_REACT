'use client';

import { useState } from 'react';
import { HelpCircle, X, Tag } from 'lucide-react';

export default function ActivityHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
        title="Guía de Etiquetas"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-8 left-0 md:left-auto md:right-[-100px] w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-slate-800 text-sm">Guía de Visualización</h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              El portal colorea las tarjetas automáticamente según el orden de las etiquetas en Trello:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-emerald-500 rounded mt-0.5"></div>
                <div>
                  <p className="text-xs font-bold text-slate-700">1ª Etiqueta = Producto (Color)</p>
                  <p className="text-[10px] text-slate-500">
                    Define el color del borde y el nombre principal (Ej: Producto 1).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-slate-300 rounded mt-0.5"></div>
                <div>
                  <p className="text-xs font-bold text-slate-700">2ª Etiqueta = Módulo (Opcional)</p>
                  <p className="text-[10px] text-slate-500">
                    Si agregas una segunda etiqueta, aparecerá como categoría secundaria (Ej: Visor).
                  </p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                 <p className="text-[10px] text-slate-400 italic">
                    Si no hay etiquetas, la tarjeta se mostrará como "General" en color azul.
                 </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}