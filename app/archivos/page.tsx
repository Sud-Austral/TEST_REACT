import { getFiles } from '@/lib/file-actions';
import { getDeliverables } from '@/lib/trello';
import { Card, cn } from '@/components/ui';
import { 
  FileText, Download, Clock, FolderOpen, ShieldCheck, Layers,
  FileSpreadsheet, FileImage, FileCode, FileArchive, File, History, User, UserCheck
} from 'lucide-react';
import UploadModal from './UploadModal';

export const dynamic = 'force-dynamic';

export default async function FilesPage() {
  const [files, deliverables] = await Promise.all([
    getFiles(),
    getDeliverables()
  ]);

  const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch(ext) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'doc': case 'docx': return <FileText size={20} className="text-blue-600" />;
      case 'xls': case 'xlsx': case 'csv': return <FileSpreadsheet size={20} className="text-emerald-600" />;
      case 'jpg': case 'png': return <FileImage size={20} className="text-purple-600" />;
      case 'zip': return <FileArchive size={20} className="text-amber-500" />;
      default: return <File size={20} className="text-slate-400" />;
    }
  };

  const baseDocs = files.filter(f => f.category === 'BASE');
  const deliverableDocs = files.filter(f => f.category !== 'BASE');

  // Estilos estáticos
  const colorStyles = {
    indigo: { borderHover: 'hover:border-indigo-300', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', btnHover: 'hover:text-indigo-600 hover:bg-indigo-50' },
    blue: { borderHover: 'hover:border-blue-300', badge: 'bg-blue-50 text-blue-700 border-blue-100', btnHover: 'hover:text-blue-600 hover:bg-blue-50' },
    emerald: { borderHover: 'hover:border-emerald-300', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', btnHover: 'hover:text-emerald-600 hover:bg-emerald-50' }
  };

  // Componente de Fila (Reutilizable dentro del loop)
  const FileItem = ({ file, colorKey, showReviewBtn = false, productName, deliverableName }: { file: any, colorKey: 'indigo' | 'blue' | 'emerald', showReviewBtn?: boolean, productName?: string, deliverableName?: string }) => {
    const styles = colorStyles[colorKey];
    
    return (
        <div className={cn("flex justify-between items-center p-2.5 bg-white rounded border border-slate-100 shadow-sm transition-all group mb-2", styles.borderHover)}>
            <div className="flex items-center gap-3 overflow-hidden">
                {getFileIcon(file.fileName)}
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]" title={file.fileName}>
                        {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className={cn("px-1.5 py-0.5 rounded font-bold border", styles.badge)}>
                            {file.version}
                        </span>
                        <span suppressHydrationWarning>{formatDate(file.date)}</span>
                        <span>•</span>
                        <span>{formatSize(file.fileSize)}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <a 
                    href={file.filePath} 
                    download 
                    className={cn("p-1.5 text-slate-400 rounded transition-colors", styles.btnHover)}
                    title="Descargar"
                >
                    <Download size={16} />
                </a>
                
                {/* BOTÓN DE REVISIÓN PAREADO (Solo si se solicita) */}
                {showReviewBtn && productName && deliverableName && (
                    <div className="ml-1 pl-1 border-l border-slate-200">
                        <UploadModal 
                            productName={productName} 
                            deliverableName={deliverableName} 
                            btnText="Rev" // Texto corto para que quepa bien
                        />
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-12 pb-10">
      
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="text-blue-600" /> Repositorio de Archivos
            </h2>
            <p className="text-slate-500 mt-1">Gestión centralizada de la documentación.</p>
        </div>
      </div>

      {/* 1. DOCUMENTOS BASE */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" /> Documentos Base del Contrato
        </h3>
        <Card className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-l-4 border-l-indigo-500 bg-slate-50">
            {baseDocs.length === 0 ? <p className="text-slate-400 text-sm italic col-span-full">Sin documentos.</p> : baseDocs.map(f => <FileItem key={f.id} file={f} colorKey="indigo" />)}
        </Card>
      </section>

      {/* 2. ENTREGABLES PAREADOS */}
      <section className="space-y-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-blue-600" /> Entregables y Productos
        </h3>
        
        {deliverables.map((prod) => {
            const productFiles = deliverableDocs.filter(f => f.productName === prod.name);
            if (productFiles.length === 0) return null;

            return (
                <div key={prod.id} className="space-y-4">
                    <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg w-fit pr-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1"></div>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{prod.name}</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {prod.cards.map(card => {
                            const cardFiles = productFiles.filter(f => f.deliverableName === card.title);
                            if (cardFiles.length === 0) return null;

                            // Separación estricta por rol
                            const contractorFiles = cardFiles.filter(f => !f.uploaderRole || f.uploaderRole === 'CONTRATISTA');
                            const clientFiles = cardFiles.filter(f => f.uploaderRole === 'CONTRATANTE');

                            return (
                                <Card key={card.id} className="overflow-hidden border border-slate-200">
                                    <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                                            <FileText size={16} className="text-blue-500" /> {card.title}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[100px]">
                                        
                                        {/* LADO IZQUIERDO: ENTREGAS CONTRATISTA (Con botón de Revisión) */}
                                        <div className="p-4 bg-white">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                                <User size={14} /> Entregas Contratista
                                            </p>
                                            <div className="space-y-2">
                                                {contractorFiles.length === 0 && <p className="text-xs text-slate-300 italic">Pendiente.</p>}
                                                {contractorFiles.map(f => (
                                                    <FileItem 
                                                        key={f.id} 
                                                        file={f} 
                                                        colorKey="blue" 
                                                        showReviewBtn={true} // <--- AQUÍ ACTIVAMOS EL BOTÓN
                                                        productName={prod.name}
                                                        deliverableName={card.title}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* LADO DERECHO: REVISIONES CONTRATANTE */}
                                        <div className="p-4 bg-slate-50/30">
                                            <p className="text-xs font-bold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                                                <UserCheck size={14} /> Revisiones Contratante
                                            </p>
                                            <div className="space-y-2">
                                                {clientFiles.length === 0 ? (
                                                    <p className="text-xs text-slate-300 italic">Sin revisiones aún.</p>
                                                ) : (
                                                    clientFiles.map(f => <FileItem key={f.id} file={f} colorKey="emerald" />)
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            );
        })}
      </section>
    </div>
  );
}