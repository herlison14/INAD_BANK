
export enum ContractStatus {
  Overdue = "Em Atraso",
  Negotiating = "Negociando",
  Resolved = "Resolvido",
}

export enum TaskStatus {
  Pendente = "Pendente",
  EmAndamento = "Em Andamento",
  Concluida = "Concluída",
}

export enum UserRole {
  Admin = "Administrador",
  Coordenador = "Coordenador",
  Gerente = "Gerente",
}

export interface Contract {
  id: string;
  clientName: string;
  socio: string;      
  cpfCnpj: string;
  phone?: string;
  product: string;
  saldoDevedor: number;
  valorProvisionado: number;
  valorPago?: number; 
  dueDate: string;
  daysOverdue: number;
  status: ContractStatus;
  pa: string;
  gerente: string;
  managerEmail: string; 
  managerId: string;
  region: string;
  originSheet?: 'Geral' | 'Cartoes' | 'Prejuizo';
  eficiencia?: number; 
  timestamp: string; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pa?: string;
  password?: string;
  lastLogin?: string;
  isAutoRegistered?: boolean;
  createdAt?: string;
  active?: boolean;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Task {
  id: string;
  contractId: string;
  contractClient: string;
  managerEmail: string;
  description: string;
  status: TaskStatus;
  priority: 1 | 2; 
  creationDate: string;
  aiScore?: number;
  negotiationHistory?: { date: string; value: string; details: string }[];
}

export interface AppNotification {
  id: string;
  managerEmail: string;
  type: 'URGENTE' | 'META' | 'SISTEMA';
  message: string;
  timestamp: string;
  read: boolean;
}

export enum TriggerType {
  ON_IMPORT = "Ao Importar",
  ON_DAYS_OVERDUE = "Por Dias de Atraso",
}

export enum ActionType {
  CREATE_NOTIFICATION = "Criar Notificação",
  CREATE_TASK = "Criar Tarefa",
  SEND_EMAIL = "Enviar E-mail",
}

export interface AutomationAction {
  type: ActionType;
  template: string;
}

export interface AutomationCondition {
  field: keyof Contract;
  operator: '>' | '<' | '==' | '!=' | '>=' | 'contains' | 'not_contains';
  value: string | number;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  trigger: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  ruleId: string;
  ruleName: string;
  contractId: string;
  contractClient: string;
  actionType: ActionType;
  description: string;
}

export const VIEWS = {
  INICIO: 'Início',
  CARTEIRA: 'Carteira',
  ATIVIDADES: 'Atividades',
  ADMINISTRACAO: 'Administração',
  IMPORTACAO: 'Importação',
  GESTAO_TAREFAS: 'Gestão de Tarefas',
  CARTOES_ATRASO: 'Cartões em Atraso',
  ANALISE_DINAMICA: 'Análise Dinâmica',
  CALCULADORA_RENEGOCIACAO: 'Calculadora de Renegociação',
  PREJUIZO: 'Prejuízo',
  DETALHAMENTO: 'Detalhamento',
  INSIGHTS_IA: 'Insights IA',
  NOTIFICACOES: 'Notificações',
} as const;

export type ViewName = (typeof VIEWS)[keyof typeof VIEWS];

export interface AppFilters {
  pa: string;
  gerente: string;
  produto: string;
}

