'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, PlusCircle, X } from 'lucide-react';
import { uploadFile } from '@/lib/file-actions';

export default function UploadModal({ 
    productName, 
    deliverableName,
    btnText 
}: { 
    productName: string, 
    deliverableName: string,
    btnText: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    try {
      // FORZAMOS EL ROL DE CONTRATANTE PARA REVISIONES
      formData.append('uploaderRole', 'CONTRATANTE');
      formData.append('category', 'DELIVERABLE'); // Sigue siendo un entregable
      
      await uploadFile(formData);
      setIsOpen(false);
    } catch (error) {
      alert('Error al subir');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs bg-white border border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium shadow-sm"
      >
        <PlusCircle size={14} /> {btnText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Cargar Revisión (Contratante)</h3>
                    <p className="text-xs text-slate-500">{deliverableName}</p>
                </div>
                <button onClick={() => setIsOpen(false)}><X className="text-slate-400" /></button>
            </div>

            <form action={handleSubmit} className="space-y-3">
                <input type="hidden" name="productName" value={productName} />
                <input type="hidden" name="deliverableName" value={deliverableName} />

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Versión / Notas</label>
                    <input type="text" name="version" placeholder="Ej: Rev. Técnica 1" className="w-full p-2 border rounded text-sm text-slate-900" required />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                    <select name="type" className="w-full p-2 border rounded text-sm text-slate-900">
                        <option value="REVISION">En Revisión</option>
                        <option value="APROBADO">Aprobado</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
                    <input type="date" name="date" className="w-full p-2 border rounded text-sm text-slate-900" required />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Archivo</label>
                    <input type="file" name="file" className="w-full text-sm text-slate-500" required />
                </div>

                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mt-2 flex justify-center items-center gap-2"
                >
                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                    Subir Revisión
                </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}