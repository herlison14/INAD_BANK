
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
  cpfCnpj: string;
  product: string;
  saldoDevedor: number;
  valorProvisionado: number;
  dueDate: string;
  daysOverdue: number;
  status: ContractStatus;
  pa: string;
  gerente: string;
  managerId: string; // ID do gestor para filtragem de segurança
  region: string;
  originSheet?: 'Geral' | 'Cartoes';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pa?: string; // Unidade de Negócio vinculada
  password?: string; // Simulação de hash local
  lastLogin?: string;
  isAutoRegistered?: boolean; // Marca se foi criado via importação
}

export interface TaskReminder {
  type: 'email' | 'app';
  scheduledFor: string;
}

export interface Task {
  id: string;
  contract: Contract;
  manager: string;
  description: string;
  status: TaskStatus;
  creationDate: string;
  reminder?: TaskReminder;
  aiScore?: number;
}

export interface AppNotification {
  id: string;
  contract: Contract;
  message: string;
  timestamp: string;
  read: boolean;
}

export enum TriggerType {
  ON_IMPORT = "Ao Importar",
  ON_TASK_UPDATE = "Ao Atualizar Tarefa",
}

export enum ActionType {
  CREATE_TASK = "Criar Tarefa",
  CREATE_NOTIFICATION = "Notificar Usuário",
  LOG_ONLY = "Registrar Log",
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
  ruleName: string;
  contractId: string;
  contractClient: string;
  actionType: ActionType;
  description: string;
  timestamp: string;
}
