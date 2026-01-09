import { getActivities } from '@/lib/trello';
import ActivityViews from './ActivityViews';

export const dynamic = 'force-dynamic';

export default async function ActividadesPage() {
  const activities = await getActivities();
  
  // Generamos la fecha en el servidor
  const serverNow = new Date().getTime();

  return <ActivityViews activities={activities} baseTime={serverNow} />;
}