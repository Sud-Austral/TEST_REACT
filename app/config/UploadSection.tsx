'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { UploadCloud, CheckCircle, Loader2, FileBadge, Layers, AlertCircle } from 'lucide-react';
import { uploadFile } from '@/lib/file-actions';
import { Deliverable } from '@/lib/trello';

export default function UploadSection({ deliverables }: { deliverables: Deliverable[] }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'DELIVERABLE' | 'BASE'>('DELIVERABLE');
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    setMsg(null);
    
    try {
      formData.set('category', uploadType); 
      await uploadFile(formData);
      setMsg({ type: 'success', text: 'Archivo verificado y guardado correctamente.' });
    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: 'Error al guardar el archivo en el servidor.' });
    } finally {
      setIsUploading(false);
    }
  }

  const availableDeliverables = selectedProductIndex !== null 
    ? deliverables[selectedProductIndex].cards 
    : [];

  return (
    <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm bg-white">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <UploadCloud size={20} className="text-blue-600" /> 
        Cargar Archivos al Repositorio
      </h3>

      <div className="flex gap-4 mb-6">
        <button
            type="button"
            onClick={() => setUploadType('DELIVERABLE')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                uploadType === 'DELIVERABLE' 
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
        >
            <Layers size={18} /> Entregable de Producto
        </button>
        <button
            type="button"
            onClick={() => setUploadType('BASE')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                uploadType === 'BASE' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' 
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
        >
            <FileBadge size={18} /> Documento Base
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {uploadType === 'DELIVERABLE' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Producto</label>
                        <select 
                            name="productName" 
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500"
                            onChange={(e) => setSelectedProductIndex(e.target.selectedIndex - 1)}
                            required
                        >
                            <option value="">Seleccione...</option>
                            {deliverables.map((d) => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Entregable</label>
                        <select 
                            name="deliverableName" 
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500"
                            disabled={selectedProductIndex === null}
                            required
                        >
                            <option value="">Seleccione...</option>
                            {availableDeliverables.map((card) => (
                                <option key={card.id} value={card.title}>{card.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Versión</label>
                        <input type="text" name="version" placeholder="Ej: v1.0" className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                        <select name="type" className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500">
                            <option value="BORRADOR">Borrador</option>
                            <option value="FINAL">Final</option>
                        </select>
                    </div>
                </>
            )}

            {uploadType === 'BASE' && (
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Documento</label>
                    <select name="deliverableName" className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500" required>
                        <option value="Términos de Referencia (TdR)">Términos de Referencia (TdR)</option>
                        <option value="Contrato">Contrato Firmado</option>
                        <option value="Propuesta Técnica">Propuesta Técnica</option>
                        <option value="Propuesta Económica">Propuesta Económica</option>
                        <option value="Orden de Inicio">Orden de Inicio</option>
                        <option value="Insumos del Cliente">Insumos del Cliente</option>
                        <option value="Otro">Otro Documento</option>
                    </select>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Fecha del Documento</label>
                <input type="date" name="date" className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 outline-none focus:border-blue-500" required />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Archivo</label>
                <input type="file" name="file" className="w-full p-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-sm file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
            </div>
        </div>

        <div className="flex justify-end pt-4 items-center gap-4">
            {msg && (
                <div className={`text-sm font-bold flex items-center gap-1 animate-in fade-in ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {msg.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} 
                    {msg.text}
                </div>
            )}
            
            <button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition-colors disabled:opacity-50">
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {isUploading ? 'Subiendo...' : 'Guardar en Repositorio'}
            </button>
        </div>
      </form>
    </Card>
  );
}