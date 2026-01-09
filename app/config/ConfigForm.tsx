'use client';

import { useState } from 'react';
import { ProjectSettings } from '@/lib/settings';
import { saveSettings } from '@/lib/actions';
import { Save, Calendar, Info, Plus, Trash2, GripVertical, Type } from 'lucide-react';
import { Card } from '@/components/ui';

export default function ConfigForm({ initialSettings }: { initialSettings: ProjectSettings }) {
  const [milestones, setMilestones] = useState(initialSettings.milestones);

  const addMilestone = () => {
    setMilestones([...milestones, { name: 'Nuevo Hito', date: '' }]);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  return (
    <form action={saveSettings} className="space-y-8">
      
      {/* Sección 0: Identidad del Proyecto (NUEVO) */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Type size={20} className="text-emerald-600" /> 
          Identidad del Proyecto
        </h3>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nombre del Proyecto</label>
            <input 
              type="text" 
              name="projectName"
              defaultValue={initialSettings.projectName}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white font-medium"
              placeholder="Ej: Observatorio Ambiental Regional"
              required
            />
            <p className="text-xs text-slate-400">Este nombre aparecerá en la cabecera de todas las páginas.</p>
        </div>
      </Card>

      {/* Sección 1: General */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-emerald-600" /> 
          Línea Base Temporal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Fecha de Orden de Inicio</label>
            <input 
              type="date" 
              name="startDate"
              defaultValue={initialSettings.startDate}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
            />
            <p className="text-xs text-slate-400">Punto de partida para el cálculo de días calendario.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-600 flex items-start gap-2">
            <Info size={16} className="mt-0.5 text-blue-500 flex-shrink-0" />
            <p>La línea de tiempo se ajustará automáticamente según los hitos que definas a continuación.</p>
          </div>
        </div>
      </Card>

      {/* Sección 2: Hitos Dinámicos */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Hitos y Entregables</h3>
            <button 
                type="button" 
                onClick={addMilestone}
                className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={16} /> Agregar Hito
            </button>
        </div>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="hidden md:flex mt-4 text-slate-400 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
              </div>
              
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-200 flex-shrink-0 mt-1 shadow-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Entregable</label>
                  <input 
                    type="text" 
                    name="milestone_names" 
                    defaultValue={milestone.name} 
                    className="w-full p-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-slate-900 bg-white placeholder:text-slate-400" 
                    placeholder="Ej: Entrega Final"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fecha Límite</label>
                  <input 
                    type="date" 
                    name="milestone_dates" 
                    defaultValue={milestone.date} 
                    className="w-full p-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-slate-900 bg-white" 
                    required
                  />
                </div>
              </div>

              <div className="flex items-center mt-1 md:mt-6">
                <button 
                    type="button" 
                    onClick={() => removeMilestone(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                    title="Eliminar hito"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {milestones.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                No hay hitos definidos. Agrega uno para comenzar.
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end pt-4 sticky bottom-6">
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl border border-emerald-500 flex items-center gap-2 transition-transform transform active:scale-95">
          <Save size={20} />
          Guardar Configuración
        </button>
      </div>
    </form>
  );
}