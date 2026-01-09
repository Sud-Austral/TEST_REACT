import { getSettings } from '@/lib/settings';
import { getDeliverables } from '@/lib/trello';
import { getFiles } from '@/lib/file-actions'; // Importamos getFiles
import { Settings } from 'lucide-react';
import ConfigForm from './ConfigForm';
import UploadSection from './UploadSection';
import FileList from './FileList'; // Importamos el nuevo componente

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const [settings, deliverables, files] = await Promise.all([
    getSettings(),
    getDeliverables(),
    getFiles()
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
          <Settings size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuración del Proyecto</h2>
          <p className="text-slate-500">Administra los hitos, cronograma y repositorio documental.</p>
        </div>
      </div>

      {/* 1. Configuración de Hitos */}
      <ConfigForm initialSettings={settings} />

      <div className="h-px bg-slate-200 my-8"></div>

      {/* 2. Subida de Archivos */}
      <UploadSection deliverables={deliverables} />

      {/* 3. Lista de Archivos (Gestión/Borrado) */}
      <FileList files={files} />
    </div>
  );
}