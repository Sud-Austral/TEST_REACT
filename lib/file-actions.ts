'use server';

import { prisma } from './db';
import { writeFile, mkdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  const category = formData.get('category') as string || 'DELIVERABLE';
  
  // Capturamos el rol (si no viene, asumimos Contratista)
  const uploaderRole = formData.get('uploaderRole') as string || 'CONTRATISTA';
  
  let productName = formData.get('productName') as string;
  let deliverableName = formData.get('deliverableName') as string;
  let version = formData.get('version') as string;
  let type = formData.get('type') as string;
  const dateStr = formData.get('date') as string;

  if (category === 'BASE') {
      productName = 'Documentación Base';
      version = 'v1'; 
      type = 'OFICIAL';
  }

  if (!file || file.size === 0) throw new Error('Archivo vacío o no recibido.');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}-${safeName}`;
  
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const relativePath = `/uploads/${uniqueName}`;
  const absolutePath = join(uploadDir, uniqueName);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) { console.error(e); }

  // 1. Escribir en Disco
  await writeFile(absolutePath, buffer);

  // 2. VALIDACIÓN FÍSICA (Lo que pediste)
  try {
      const stats = await stat(absolutePath);
      // Margen de error de 0 bytes. Debe ser exacto.
      if (stats.size !== file.size) {
          throw new Error(`Error de integridad: Se esperaban ${file.size} bytes, se guardaron ${stats.size}.`);
      }
  } catch (error) {
      // Si falla la validación, borramos el archivo corrupto y lanzamos error
      try { await unlink(absolutePath); } catch {}
      throw new Error('El archivo no se guardó correctamente en el disco. Intente de nuevo.');
  }

  // 3. Guardar en BD solo si pasó la validación
  await prisma.projectFile.create({
    data: {
      productName,
      deliverableName,
      version,
      type,
      category,
      uploaderRole, // Guardamos quién lo subió
      date: new Date(dateStr),
      fileName: file.name,
      filePath: relativePath,
      fileSize: file.size
    }
  });

  revalidatePath('/archivos');
  revalidatePath('/config');
}

export async function getFiles() {
  return await prisma.projectFile.findMany({
    orderBy: { date: 'desc' }
  });
}

export async function deleteFile(fileId: string, filePath: string) {
    try {
        await prisma.projectFile.delete({ where: { id: fileId } });
        const absolutePath = join(process.cwd(), 'public', filePath);
        await unlink(absolutePath);
    } catch (e) {
        console.error("Error borrando archivo:", e);
    }
    revalidatePath('/config');
    revalidatePath('/archivos');
}