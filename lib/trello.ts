import { prisma } from './db';
import { getSettings } from './settings';

// --- DEFINICIONES DE TIPO ---

export type ProjectStatus = 'EN_CURSO' | 'EN_RIESGO' | 'RETRASADO';

export interface DashboardMetrics {
  status: ProjectStatus;
  openRisks: number;
  openIncidents: number;
  completedActivities: number;
  totalActivities: number;
  deliverablesProgress: number;
}

export interface Activity {
  id: string;
  title: string;
  status: 'PENDIENTE' | 'EN_EJECUCION' | 'EN_REVISION' | 'APROBADO';
  phase: string;
  phaseColor: string;
  module: string;
  startDate: Date | null; // <--- NUEVO CAMPO
  dueDate: Date | null;
  url: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface DeliverableCard {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  checklist: ChecklistItem[];
  evidenceUrl?: string;
  statusLabel: string;
}

export interface Deliverable {
  id: string;
  name: string;
  dueDate: Date;
  status: 'PREPARACION' | 'REVISION' | 'AJUSTES' | 'APROBADO';
  progress: number;
  cards: DeliverableCard[];
}

export interface RiskOrIncident {
  id: string;
  title: string;
  type: 'RIESGO' | 'BLOQUEO' | 'INCIDENCIA' | 'DECISION';
  severity: 'ALTA' | 'MEDIA' | 'BAJA';
  status: 'ABIERTO' | 'RESUELTO';
  description: string;
  url: string;
  color: string;
  date?: string;
}

// --- CLIENTE API ---

const fetchTrello = async (path: string) => {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return null;
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  if (!key || !token) return null;
  const separator = path.includes('?') ? '&' : '?';
  const url = `https://api.trello.com/1/${path}${separator}key=${key}&token=${token}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { return null; }
};

// --- ACTIONS ---

export async function getDashboardData(): Promise<DashboardMetrics> {
  try {
    const activities = await getActivities();
    const risks = await getRisksAndQA();
    const deliverables = await getDeliverables();

    const total = activities.length;
    const completed = activities.filter(a => a.status === 'APROBADO').length;
    const openRisks = risks.filter(r => (r.type === 'BLOQUEO' || r.type === 'RIESGO') && r.status === 'ABIERTO').length;
    const openIncidents = risks.filter(r => r.type === 'INCIDENCIA' && r.status === 'ABIERTO').length;
    
    let status: ProjectStatus = 'EN_CURSO';
    if (openRisks > 0 || openIncidents > 0) status = 'EN_RIESGO';
    
    let totalProgressSum = 0;
    let totalProducts = deliverables.length;
    if (totalProducts > 0) {
       deliverables.forEach(d => { totalProgressSum += d.progress; });
    }
    const progress = totalProducts > 0 ? Math.round(totalProgressSum / totalProducts) : 0;

    return { status, openRisks, openIncidents, completedActivities: completed, totalActivities: total, deliverablesProgress: progress };
  } catch (e) {
    return { status: 'EN_CURSO', openRisks: 0, openIncidents: 0, completedActivities: 0, totalActivities: 0, deliverablesProgress: 0 };
  }
}

export async function getActivities(): Promise<Activity[]> {
  const boardId = process.env.TRELLO_BOARD_ACTIVITIES_ID;
  if (!boardId) return [];

  try {
    const lists = await fetchTrello(`boards/${boardId}/lists`);
    if (!lists) return [];
    const cards = await fetchTrello(`boards/${boardId}/cards?customFieldItems=true`);

    return cards.map((c: any) => {
      const listName = lists.find((l: any) => l.id === c.idList)?.name.toLowerCase() || '';
      let status: Activity['status'] = 'PENDIENTE';
      
      if (listName.includes('ejecución') || listName.includes('ejecucion')) status = 'EN_EJECUCION';
      if (listName.includes('revisión') || listName.includes('revision')) status = 'EN_REVISION';
      if (listName.includes('aprobado')) status = 'APROBADO';

      const labels = c.labels || [];
      let phase = 'General';
      let phaseColor = 'blue';
      let module = ''; 

      if (labels.length > 0) {
        phase = labels[0].name;
        phaseColor = labels[0].color || 'blue';
        if (labels.length > 1) {
            module = labels[1].name;
        }
      }

      return {
        id: c.id,
        title: c.name,
        status,
        phase,
        phaseColor,
        module,
        // CAPTURAMOS FECHAS REALES
        startDate: c.start ? new Date(c.start) : null,
        dueDate: c.due ? new Date(c.due) : null,
        url: c.shortUrl
      };
    });
  } catch (e) {
    return [];
  }
}

// ... (Las funciones getDeliverables y getRisksAndQA se mantienen idénticas, asegúrate de mantenerlas en el archivo)
export async function getDeliverables(): Promise<Deliverable[]> {
    const boardId = process.env.TRELLO_BOARD_DELIVERABLES_ID;
    const settings = await getSettings();
    if (!boardId) return [];
    try {
        const lists = await fetchTrello(`boards/${boardId}/lists`);
        if (!lists) return [];
        const cards = await fetchTrello(`boards/${boardId}/cards?checklists=all&attachments=true`);
        return settings.milestones.map((milestone, index) => {
            const trelloList = lists[index];
            const listCardsRaw = trelloList ? cards.filter((c: any) => c.idList === trelloList.id) : [];
            const cardsProcessed: DeliverableCard[] = listCardsRaw.map((c: any) => {
                let totalItems = 0; let completedItems = 0; const checklistItems: ChecklistItem[] = [];
                if (c.checklists) { c.checklists.forEach((cl: any) => { if (cl.checkItems) { cl.checkItems.forEach((ci: any) => { totalItems++; const isDone = ci.state === 'complete'; if (isDone) completedItems++; checklistItems.push({ id: ci.id, title: ci.name, completed: isDone }); }); } }); }
                let cardProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : (c.dueComplete ? 100 : 0);
                return { id: c.id, title: c.name, completed: c.dueComplete, progress: cardProgress, checklist: checklistItems, evidenceUrl: c.attachments?.length > 0 ? c.attachments[0].url : c.shortUrl, statusLabel: c.labels?.length > 0 ? c.labels[0].name : '' };
            });
            const productProgress = cardsProcessed.length > 0 ? Math.round(cardsProcessed.reduce((acc, curr) => acc + curr.progress, 0) / cardsProcessed.length) : 0;
            const allDone = productProgress === 100;
            return { id: trelloList ? trelloList.id : `mock-${index}`, name: milestone.name, dueDate: milestone.date ? new Date(milestone.date) : new Date(), status: allDone ? 'APROBADO' : 'PREPARACION', progress: productProgress, cards: cardsProcessed };
        });
    } catch (e) { return []; }
}

export async function getRisksAndQA(): Promise<RiskOrIncident[]> {
    const boardId = process.env.TRELLO_BOARD_QA_ID;
    if (!boardId) return [];
    try {
        const lists = await fetchTrello(`boards/${boardId}/lists`);
        if (!lists) return [];
        const cards = await fetchTrello(`boards/${boardId}/cards?customFieldItems=true`);
        return cards.map((c: any) => {
             const listName = lists.find((l: any) => l.id === c.idList)?.name.toLowerCase() || '';
             let type: RiskOrIncident['type'] = 'INCIDENCIA';
             if (listName.includes('riesgo')) type = 'RIESGO'; if (listName.includes('bloqueo')) type = 'BLOQUEO'; if (listName.includes('decisi')) type = 'DECISION';
             const label = c.labels?.find((l: any) => l.color === 'red' || l.color === 'yellow' || l.color === 'orange' || l.color === 'green');
             let severity: RiskOrIncident['severity'] = 'BAJA'; let color = 'blue';
             if (label) { color = label.color; if (color === 'red') severity = 'ALTA'; else if (color === 'yellow' || color === 'orange') severity = 'MEDIA'; }
             let isResolved = false;
             if (c.due) { const dueDate = new Date(c.due); const today = new Date(); dueDate.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0); isResolved = dueDate.getTime() <= today.getTime(); }
             return { id: c.id, title: c.name, type, severity, status: isResolved ? 'RESUELTO' : 'ABIERTO', description: c.desc, url: c.shortUrl, color, date: c.due };
        });
    } catch (e) { return []; }
}