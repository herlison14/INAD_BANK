
import { UserRole } from '../types';

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId: string;
  jobTitle: string;
  tags: string[];
  engagementScore: number;
  avatar?: string;
}

export interface CRMOrganization {
  id: string;
  name: string;
  sector: string;
  size: string;
  website: string;
  address: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stageId: string;
  contactId: string;
  companyId: string;
  ownerId: string;
  expectedCloseDate: string;
  probability: number;
  status: 'open' | 'won' | 'lost';
  lostReason?: string;
}

export interface CRMStage {
  id: string;
  name: string;
  order: number;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'lunch' | 'deadline' | 'whatsapp';
  title: string;
  description: string;
  dueDate: string;
  duration: number; // minutes
  status: 'pending' | 'completed' | 'overdue';
  contactId?: string;
  dealId?: string;
  companyId?: string;
  ownerId: string;
}

export const MOCK_STAGES: CRMStage[] = [
  { id: 'lead', name: 'Prospecção', order: 0 },
  { id: 'qualified', name: 'Qualificação', order: 1 },
  { id: 'proposal', name: 'Proposta', order: 2 },
  { id: 'negotiation', name: 'Negociação', order: 3 },
  { id: 'closed', name: 'Fechado', order: 4 },
];

export const MOCK_ORGANIZATIONS: CRMOrganization[] = [
  { id: 'org1', name: 'Sicoob Central', sector: 'Financeiro', size: 'Grande', website: 'www.sicoob.com.br', address: 'Brasília, DF' },
  { id: 'org2', name: 'Tech Solutions', sector: 'Tecnologia', size: 'Média', website: 'www.techsol.com', address: 'São Paulo, SP' },
];

export const MOCK_CONTACTS: CRMContact[] = [
  { id: 'cont1', name: 'João Silva', email: 'joao@sicoob.com.br', phone: '(61) 99999-9999', companyId: 'org1', jobTitle: 'Gerente de TI', tags: ['VIP', 'Decisor'], engagementScore: 85 },
  { id: 'cont2', name: 'Maria Oliveira', email: 'maria@techsol.com', phone: '(11) 88888-8888', companyId: 'org2', jobTitle: 'Diretora Comercial', tags: ['Novo'], engagementScore: 40 },
];

export const MOCK_DEALS: CRMDeal[] = [
  { id: 'deal1', title: 'Expansão de Servidores', value: 50000, currency: 'BRL', stageId: 'negotiation', contactId: 'cont1', companyId: 'org1', ownerId: 'user1', expectedCloseDate: '2026-04-15', probability: 70, status: 'open' },
  { id: 'deal2', title: 'Consultoria de Nuvem', value: 15000, currency: 'BRL', stageId: 'lead', contactId: 'cont2', companyId: 'org2', ownerId: 'user1', expectedCloseDate: '2026-05-20', probability: 20, status: 'open' },
];

export const MOCK_ACTIVITIES: CRMActivity[] = [
  { id: 'act1', type: 'call', title: 'Ligar para João', description: 'Confirmar detalhes da proposta', dueDate: '2026-03-15T10:00:00', duration: 15, status: 'pending', contactId: 'cont1', dealId: 'deal1', ownerId: 'user1' },
  { id: 'act2', type: 'meeting', title: 'Reunião Tech Solutions', description: 'Apresentação institucional', dueDate: '2026-03-14T14:30:00', duration: 60, status: 'pending', contactId: 'cont2', companyId: 'org2', ownerId: 'user1' },
];
