'use client';

import { Trash2, FileText, Download, ShieldCheck, Layers, Folder, User, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import { deleteFile } from '@/lib/file-actions';

type SimpleFile = {
    id: string;
    fileName: string;
    filePath: string;
    productName: string;
    deliverableName: string;
    date: Date;
    category: string;
    uploaderRole?: string;
};

export default function FileList({ files }: { files: SimpleFile[] }) {
  
  const handleDelete = async (id: string, path: string) => {
    if(confirm('¿Eliminar archivo permanentemente?')) {
        await deleteFile(id, path);
    }
  };

  const baseFiles = files.filter(f => f.category === 'BASE');
  const deliverableFiles = files.filter(f => f.category !== 'BASE');

  // Agrupación Inteligente
  const groupedFiles: Record<string, Record<string, { contractor: SimpleFile[], client: SimpleFile[] }>> = {};

  deliverableFiles.forEach(file => {
    const prod = file.productName || 'Sin Producto';
    const deliv = file.deliverableName || 'General';
    
    if (!groupedFiles[prod]) groupedFiles[prod] = {};
    if (!groupedFiles[prod][deliv]) groupedFiles[prod][deliv] = { contractor: [], client: [] };
    
    if (!file.uploaderRole || file.uploaderRole === 'CONTRATISTA') {
        groupedFiles[prod][deliv].contractor.push(file);
    } else {
        groupedFiles[prod][deliv].client.push(file);
    }
  });

  const renderSimpleFileRow = (file: SimpleFile, colorClass: string) => (
    <div key={file.id} className={`py-2 px-3 flex justify-between items-center group border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 border-l-2 ${colorClass} transition-all`}>
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span suppressHydrationWarning className="text-[10px] text-slate-400 whitespace-nowrap min-w-[60px]">
                {new Date(file.date).toLocaleDateString()}
            </span>
            <span className="text-sm font-medium text-slate-700 truncate" title={file.fileName}>{file.fileName}</span>
        </div>
        <button 
            onClick={() => handleDelete(file.id, file.filePath)}
            className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
            title="Eliminar"
        >
            <Trash2 size={14} />
        </button>
    </div>
  );

  return (
    <div className="space-y-8 mt-8">
        
        {/* BLOQUE 1: DOCUMENTOS BASE */}
        <Card className="p-6 border-l-4 border-l-indigo-500 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-600" />
                Documentos Base del Contrato ({baseFiles.length})
            </h3>
            {baseFiles.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Sin documentos base.</p>
            ) : baseFiles.map(f => renderSimpleFileRow(f, 'border-l-indigo-500'))}
        </Card>

        {/* BLOQUE 2: ENTREGABLES PAREADOS */}
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" />
                Gestión de Entregables ({deliverableFiles.length})
            </h3>
            
            {Object.keys(groupedFiles).length === 0 ? (
                <p className="text-slate-400 text-sm italic">No se han cargado entregables técnicos.</p>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedFiles).map(([prodName, delivs]) => (
                        <div key={prodName} className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider bg-slate-50 p-2 rounded border border-slate-100">
                                {prodName}
                            </h4>
                            
                            <div className="pl-2 space-y-6">
                                {Object.entries(delivs).map(([delivName, groups]) => (
                                    <div key={delivName} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-slate-100/50 p-2 border-b border-slate-200 flex items-center gap-2">
                                            <Folder size={14} className="text-blue-400" />
                                            <span className="text-sm font-semibold text-slate-800">{delivName}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                            {/* Columna Contratista */}
                                            <div className="p-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1 pl-2">
                                                    <User size={12} /> Originales
                                                </p>
                                                {groups.contractor.length === 0 && <p className="text-xs text-slate-300 italic pl-2">Vacío</p>}
                                                {groups.contractor.map(f => renderSimpleFileRow(f, 'border-l-blue-500'))}
                                            </div>

                                            {/* Columna Cliente */}
                                            <div className="p-2 bg-slate-50/30">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1 pl-2">
                                                    <UserCheck size={12} /> Revisiones
                                                </p>
                                                {groups.client.length === 0 && <p className="text-xs text-slate-300 italic pl-2">Vacío</p>}
                                                {groups.client.map(f => renderSimpleFileRow(f, 'border-l-emerald-500'))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    </div>
  );
}