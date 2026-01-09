import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/components/ui';
import { getSettings } from '@/lib/settings';
import { getDeliverables } from '@/lib/trello';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Portal de Seguimiento - CCAD',
  description: 'Sistema de monitoreo de consultoría en tiempo real',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Cargar datos del servidor
  const settings = await getSettings();
  const deliverables = await getDeliverables();

  // 2. Cálculos de negocio
  let totalProgressSum = 0;
  if (deliverables.length > 0) {
    deliverables.forEach(d => { totalProgressSum += d.progress; });
  }
  const globalProgress = deliverables.length > 0 ? Math.round(totalProgressSum / deliverables.length) : 0;
  const isFinished = globalProgress === 100;

  const startDate = new Date(settings.startDate);
  const today = new Date();
  
  const milestoneDates = settings.milestones
    .map(m => m.date ? new Date(m.date).getTime() : 0)
    .filter(d => d > 0);
  
  const endDate = milestoneDates.length > 0 
    ? new Date(Math.max(...milestoneDates)) 
    : new Date(startDate.getTime() + (120 * 24 * 60 * 60 * 1000));

  const oneDay = 1000 * 60 * 60 * 24;
  const elapsedRaw = Math.floor((today.getTime() - startDate.getTime()) / oneDay);
  const remainingRaw = Math.ceil((endDate.getTime() - today.getTime()) / oneDay);

  const metrics = {
    startDate,
    endDate,
    daysElapsed: elapsedRaw > 0 ? elapsedRaw : 0,
    daysRemaining: remainingRaw > 0 ? remainingRaw : 0,
    isFinished
  };

  // 3. Renderizar el Shell Cliente
  return (
    <html lang="es">
      <body className={cn(inter.className, "bg-slate-50")}>
        <AppShell settings={settings} metrics={metrics}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}