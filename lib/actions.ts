'use server';

import { prisma } from './db';
import { revalidatePath } from 'next/cache';
import { ProjectSettings, Milestone } from './settings';

export async function saveSettings(formData: FormData) {
  const projectName = formData.get('projectName') as string; // <--- CAPTURAR NOMBRE
  const startDate = formData.get('startDate') as string;
  
  const names = formData.getAll('milestone_names');
  const dates = formData.getAll('milestone_dates');

  const milestones: Milestone[] = names.map((name, index) => ({
    name: name as string,
    date: dates[index] as string,
  }));

  const settings: ProjectSettings = {
    projectName, // <--- GUARDAR NOMBRE
    startDate,
    milestones
  };

  await prisma.systemConfig.upsert({
    where: { key: 'project_settings' },
    update: { value: JSON.stringify(settings) },
    create: { key: 'project_settings', value: JSON.stringify(settings) }
  });

  revalidatePath('/');
  revalidatePath('/config');
}