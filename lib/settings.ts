import { prisma } from './db';

// Archivo SOLO para tipos y lectura de datos.

export interface Milestone {
  name: string;
  date: string;
}

export interface ProjectSettings {
  projectName: string; // <--- NUEVO CAMPO
  startDate: string;
  milestones: Milestone[];
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  projectName: 'Observatorio Ambiental Regional (OAR)', // Valor por defecto
  startDate: '2025-12-15',
  milestones: [
    { name: 'Producto 1 (Diagnóstico)', date: '2026-01-14' },
    { name: 'Producto 2 (Prototipo)', date: '2026-03-15' },
    { name: 'Producto 3 (Informe Final)', date: '2026-04-14' }
  ]
};

export async function getSettings(): Promise<ProjectSettings> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'project_settings' }
    });
    
    if (!config) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(config.value);
    
    // Merge con defaults para asegurar que siempre haya un nombre
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}