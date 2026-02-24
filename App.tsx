
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { UserRole, TaskStatus, AppNotification, User, Contract, Task } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { Skeleton } from './components/ui/Skeleton';
import { useDebounce } from './hooks/useDebounce';
import { AppProvider, useApp, ImportSyncResult } from './context/AppContext';
import { useSelfHealing } from './hooks/useSelfHealing';
import FilterBar from './components/FilterBar';
import LoginView from './components/LoginView';
import FeatherIcon from './components/FeatherIcon';
import PredictiveAIAlerts from './components/PredictiveAIAlerts';

// Components de Visualização
import ImportacaoView from './components/ImportacaoView';
import InsightsIAView from './components/InsightsIAView';
import DetalhamentoView from './components/DetalhamentoView';
import GestaoTarefasView from './components/GestaoTarefasView';
import NotificacoesView from './components/NotificacoesView';
import CartoesAtrasoView from './components/CartoesAtrasoView';
import VisaoDinamicaView from './components/VisaoDinamicaView';
import CalculadoraRenegociacaoView from './components/CalculadoraRenegociacaoView';
import AnaliseDinamicaView from './components/AnaliseDinamicaView';
import AnaliseDinamicaPro from './components/AnaliseDinamicaPro';
import AutomacoesView from './components/AutomacoesView';
import LetreiroDinamico from './components/LetreiroDinamico';

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const VIEWS = {
  DASHBOARD: 'Dashboard Principal',
  ANALISE_DINAMICA: 'Análise Dinâmica',
  IMPORTACAO: 'Importação',
  INSIGHTS_IA: 'Insights de IA',
  DETALHAMENTO: 'Detalhamento',
  GESTAO_TAREFAS: 'Gestão de Tarefas',
  NOTIFICACOES: 'Notificações',
  CARTOES_ATRASO: 'Cartões em Atraso',
  CALCULADORA: 'Calculadora',
  ADMINISTRACAO: 'Administração',
  AUTOMACOES: 'Automações',
} as const;

export type ViewName = (typeof VIEWS)[keyof typeof VIEWS];

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE SEGURANÇA
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<UserRole, ViewName[]> = {
  [UserRole.Admin]: Object.values(VIEWS) as ViewName[],
  [UserRole.Coordenador]: [
    VIEWS.DASHBOARD, VIEWS.ANALISE_DINAMICA, VIEWS.IMPORTACAO, VIEWS.INSIGHTS_IA,
    VIEWS.DETALHAMENTO, VIEWS.GESTAO_TAREFAS, VIEWS.NOTIFICACOES,
    VIEWS.CARTOES_ATRASO, VIEWS.CALCULADORA, VIEWS.AUTOMACOES,
  ],
  [UserRole.Gerente]: [
    VIEWS.DASHBOARD, VIEWS.DETALHAMENTO, VIEWS.GESTAO_TAREFAS,
    VIEWS.NOTIFICACOES, VIEWS.CARTOES_ATRASO, VIEWS.CALCULADORA,
  ],
};

function canAccess(role: UserRole, view: ViewName): boolean {
  return ROLE_PERMISSIONS[role]?.includes(view) ?? false;
}

const AccessDenied: React.FC<{ role: UserRole }> = ({ role }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full py-32 text-center">
    <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
      <FeatherIcon name="lock" className="w-9 h-9 text-red-500" />
    </div>
    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Acesso Restrito</h2>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
      Seu perfil <span className="font-bold text-slate-700 dark:text-slate-300">({role})</span> não
      tem permissão para acessar esta área.
    </p>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TOAST DE SINCRONIZAÇÃO — exibido após importação com sucesso
// ─────────────────────────────────────────────────────────────────────────────
const SyncToast: React.FC<{ result: ImportSyncResult; onClose: () => void }> = ({ result, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="fixed top-6 right-6 z-[100] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-5 w-80"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <FeatherIcon name="check-circle" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="font-black text-slate-800 dark:text-white text-sm">Sincronização Completa</span>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
        <FeatherIcon name="x" className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-2">
      {[
        { icon: 'file-text', label: 'Contratos importados', value: result.inserted, color: 'text-blue-500' },
        { icon: 'check-square', label: 'Tarefas geradas', value: result.tasksGenerated, color: 'text-violet-500' },
        { icon: 'bell', label: 'Notificações criadas', value: result.notificationsGenerated, color: 'text-orange-500' },
        ...(result.duplicates > 0 ? [{ icon: 'copy', label: 'Duplicatas ignoradas', value: result.duplicates, color: 'text-slate-400' }] : []),
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <FeatherIcon name={item.icon} className={`w-3.5 h-3.5 ${item.color}`} />
            {item.label}
          </span>
          <span className={`font-black ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      Tarefas e Notificações atualizadas automaticamente.
    </p>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMINISTRAÇÃO — embutida no App
// ─────────────────────────────────────────────────────────────────────────────
interface Operador { id: string; name: string; email: string; role: UserRole; pa: string; createdAt: string; active: boolean; }
interface FormState { name: string; email: string; role: UserRole; pa: string; password: string; }

const ROLE_LABELS: Record<UserRole, string> = { [UserRole.Admin]: 'Administrador', [UserRole.Coordenador]: 'Coordenador', [UserRole.Gerente]: 'Gerente' };
const ROLE_COLORS: Record<UserRole, string> = { [UserRole.Admin]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', [UserRole.Coordenador]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', [UserRole.Gerente]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
const ROLE_ICON: Record<UserRole, string> = { [UserRole.Admin]: 'shield', [UserRole.Coordenador]: 'briefcase', [UserRole.Gerente]: 'user' };
const INITIAL_FORM: FormState = { name: '', email: '', role: UserRole.Gerente, pa: '', password: '' };
const MOCK_OPERADORES: Operador[] = [
  { id: '1', name: 'Ana Paula Souza', email: 'ana.souza@empresa.com', role: UserRole.Admin, pa: 'PA-001', createdAt: '2024-01-15', active: true },
  { id: '2', name: 'Carlos Mendes', email: 'carlos.mendes@empresa.com', role: UserRole.Coordenador, pa: 'PA-002', createdAt: '2024-03-10', active: true },
  { id: '3', name: 'Fernanda Lima', email: 'fernanda.lima@empresa.com', role: UserRole.Gerente, pa: 'PA-003', createdAt: '2024-05-22', active: false },
];

const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-700">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><FeatherIcon name={icon} className="w-5 h-5" /></div>
    <div><p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p><p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p></div>
  </div>
);

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>
    <FeatherIcon name={ROLE_ICON[role]} className="w-3 h-3" />{ROLE_LABELS[role]}
  </span>
);

const OperadorModal: React.FC<{ isOpen: boolean; editingOperador: Operador | null; form: FormState; onFormChange: (f: keyof FormState, v: string) => void; onSave: () => void; onClose: () => void; errors: Partial<FormState> }> = ({ isOpen, editingOperador, form, onFormChange, onSave, onClose, errors }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">{editingOperador ? 'Editar Operador' : 'Novo Operador'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{editingOperador ? 'Atualize os dados' : 'Preencha os dados e defina o cargo'}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"><FeatherIcon name="x" className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="space-y-4">
              {[{ key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Ex: João Silva' }, { key: 'email', label: 'E-mail', type: 'email', placeholder: 'operador@empresa.com' }].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof FormState]} onChange={(e) => onFormChange(key as keyof FormState, e.target.value)} placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors[key as keyof FormState] ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                  {errors[key as keyof FormState] && <p className="text-red-500 text-xs mt-1">{errors[key as keyof FormState]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">Cargo / Perfil</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.values(UserRole) as UserRole[]).map((role) => (
                    <button key={role} type="button" onClick={() => onFormChange('role', role)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-bold ${form.role === role ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'}`}>
                      <FeatherIcon name={ROLE_ICON[role]} className="w-5 h-5" />{ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
                <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                  {form.role === UserRole.Admin && '⚡ Acesso total, incluindo administração de usuários.'}
                  {form.role === UserRole.Coordenador && '📋 Todas as áreas exceto Administração.'}
                  {form.role === UserRole.Gerente && '👤 Acesso restrito à sua PA e carteira.'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">PA</label>
                <input type="text" value={form.pa} onChange={(e) => onFormChange('pa', e.target.value.toUpperCase())} placeholder="Ex: PA-001"
                  className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.pa ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                {errors.pa && <p className="text-red-500 text-xs mt-1">{errors.pa}</p>}
              </div>
              {!editingOperador && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">Senha inicial</label>
                  <input type="password" value={form.password} onChange={(e) => onFormChange('password', e.target.value)} placeholder="Mínimo 8 caracteres"
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
              <button onClick={onSave} className="flex-[2] px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-colors shadow-lg shadow-blue-500/20">{editingOperador ? 'Salvar alterações' : 'Criar operador'}</button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: LOGIN
// ─────────────────────────────────────────────────────────────────────────────

const AdministracaoView: React.FC = () => {
  const { auditLogs } = useApp();
  const [operadores, setOperadores] = useState<Operador[]>(MOCK_OPERADORES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperador, setEditingOperador] = useState<Operador | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'Todos'>('Todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const stats = useMemo(() => ({ total: operadores.length, ativos: operadores.filter((o) => o.active).length, admins: operadores.filter((o) => o.role === UserRole.Admin).length, coordenadores: operadores.filter((o) => o.role === UserRole.Coordenador).length }), [operadores]);
  const filteredOperadores = useMemo(() => { const s = searchTerm.toLowerCase(); return operadores.filter((op) => (!s || op.name.toLowerCase().includes(s) || op.email.toLowerCase().includes(s) || op.pa.toLowerCase().includes(s)) && (filterRole === 'Todos' || op.role === filterRole)); }, [operadores, searchTerm, filterRole]);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); }, []);
  const handleFormChange = useCallback((field: keyof FormState, value: string) => { setForm((prev) => ({ ...prev, [field]: value })); setErrors((prev) => ({ ...prev, [field]: undefined })); }, []);
  
  const handleExportAuditLogs = useCallback(() => {
    if (auditLogs.length === 0) {
      showToast('Nenhum log para exportar', 'error');
      return;
    }
    
    const headers = ['ID', 'Usuário', 'Ação', 'Detalhes', 'Data/Hora'];
    const rows = auditLogs.map(log => [
      log.id,
      log.userEmail,
      log.action,
      log.details,
      log.timestamp
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Logs exportados com sucesso!');
  }, [auditLogs, showToast]);

  const validate = useCallback((): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.pa.trim()) e.pa = 'PA é obrigatória';
    if (!editingOperador && form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, editingOperador]);
  const handleSave = useCallback(() => {
    if (!validate()) return;
    if (editingOperador) { setOperadores((prev) => prev.map((op) => op.id === editingOperador.id ? { ...op, ...form } : op)); showToast('Operador atualizado!'); }
    else { setOperadores((prev) => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split('T')[0], active: true }, ...prev]); showToast('Operador criado!'); }
    setIsModalOpen(false);
  }, [form, editingOperador, validate, showToast]);

  return (
    <div className="space-y-8">
      <AnimatePresence>{toast && (<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}><FeatherIcon name={toast.type === 'success' ? 'check-circle' : 'trash-2'} className="w-4 h-4" />{toast.message}</motion.div>)}</AnimatePresence>
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-black text-slate-800 dark:text-white">Administração</h1><p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gerencie operadores, cargos e permissões</p></div>
        <div className="flex gap-3">
          <button onClick={handleExportAuditLogs} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-black rounded-xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700"><FeatherIcon name="download" className="w-4 h-4" />Exportar Logs</button>
          <button onClick={() => { setEditingOperador(null); setForm(INITIAL_FORM); setErrors({}); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"><FeatherIcon name="user-plus" className="w-4 h-4" />Novo Operador</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <div key={role} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ROLE_COLORS[role]}`}><FeatherIcon name={ROLE_ICON[role]} className="w-4 h-4" /></div><span className="font-black text-slate-800 dark:text-white text-sm">{ROLE_LABELS[role]}</span></div>
            <ul className="space-y-1.5">{(Object.values(VIEWS) as ViewName[]).map((view) => { const ok = canAccess(role, view); return (<li key={view} className={`flex items-center gap-2 text-xs ${ok ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}><FeatherIcon name={ok ? 'check' : 'x'} className={`w-3 h-3 shrink-0 ${ok ? 'text-emerald-500' : 'text-red-400'}`} />{view}</li>); })}</ul>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon="users" color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatCard label="Ativos" value={stats.ativos} icon="check-circle" color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" />
        <StatCard label="Coordenadores" value={stats.coordenadores} icon="briefcase" color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" />
        <StatCard label="Admins" value={stats.admins} icon="shield" color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><FeatherIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome, e-mail ou PA..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>
        <div className="flex gap-2 flex-wrap">{(['Todos', ...Object.values(UserRole)] as (UserRole | 'Todos')[]).map((r) => (<button key={r} onClick={() => setFilterRole(r)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${filterRole === r ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800'}`}>{r === 'Todos' ? 'Todos' : ROLE_LABELS[r as UserRole]}</button>))}</div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredOperadores.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-slate-400"><FeatherIcon name="users" className="w-12 h-12 mb-4 opacity-30" /><p className="text-sm font-medium">Nenhum operador encontrado</p></div>) : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-100 dark:border-slate-700">{['Operador', 'Cargo', 'PA', 'Cadastro', 'Status', 'Ações'].map((h) => (<th key={h} className={`px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest ${h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>))}</tr></thead>
            <tbody><AnimatePresence>{filteredOperadores.map((op) => (
              <motion.tr key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-black shrink-0">{op.name.charAt(0)}</div><div><p className="text-sm font-bold text-slate-800 dark:text-white">{op.name}</p><p className="text-xs text-slate-400">{op.email}</p></div></div></td>
                <td className="px-6 py-4"><RoleBadge role={op.role} /></td>
                <td className="px-6 py-4"><span className="text-sm font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{op.pa}</span></td>
                <td className="px-6 py-4 text-xs text-slate-400">{new Date(op.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4"><button onClick={() => setOperadores((prev) => prev.map((o) => o.id === op.id ? { ...o, active: !o.active } : o))} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${op.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}><span className={`w-1.5 h-1.5 rounded-full ${op.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />{op.active ? 'Ativo' : 'Inativo'}</button></td>
                <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => { setEditingOperador(op); setForm({ name: op.name, email: op.email, role: op.role, pa: op.pa, password: '' }); setErrors({}); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><FeatherIcon name="edit-2" className="w-3.5 h-3.5" /></button>
                  {confirmDeleteId === op.id ? (<div className="flex gap-1"><button onClick={() => { setOperadores((prev) => prev.filter((o) => o.id !== op.id)); setConfirmDeleteId(null); showToast('Removido.', 'error'); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">Confirmar</button><button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">Cancelar</button></div>) : (<button onClick={() => setConfirmDeleteId(op.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><FeatherIcon name="trash-2" className="w-3.5 h-3.5" /></button>)}
                </div></td>
              </motion.tr>
            ))}</AnimatePresence></tbody>
          </table>
        )}
      </div>
      <OperadorModal isOpen={isModalOpen} editingOperador={editingOperador} form={form} onFormChange={handleFormChange} onSave={handleSave} onClose={() => setIsModalOpen(false)} errors={errors} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const handleLoginSuccess = useCallback((user: User) => { setLoggedUser(user); setIsAuthenticated(true); }, []);
  const handleLogout = useCallback(() => { setIsAuthenticated(false); setLoggedUser(null); sessionStorage.clear(); }, []);
  return { isAuthenticated, loggedUser, handleLoginSuccess, handleLogout };
}

function useNavigationState(loggedUser: User | null) {
  const [activeView, setActiveViewRaw] = useState<ViewName>(VIEWS.DASHBOARD);
  const [calculatorInitialValue, setCalculatorInitialValue] = useState<number | undefined>(undefined);
  const setActiveView = useCallback((view: ViewName) => {
    if (!loggedUser || !canAccess(loggedUser.role, view)) return;
    setActiveViewRaw(view);
  }, [loggedUser]);
  return { activeView, setActiveView, calculatorInitialValue, setCalculatorInitialValue };
}

function useFilterState() {
  const [globalSearch, setGlobalSearch] = useState('');
  const debouncedSearch = useDebounce(globalSearch, 300);
  const [filters, setFilters] = useState({ pa: 'Todas', gerente: 'Todos', produto: 'Todos' });
  return { globalSearch, setGlobalSearch, debouncedSearch, filters, setFilters };
}

// ─────────────────────────────────────────────────────────────────────────────
// APP CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { healingError } = useSelfHealing();
  const { allContracts, notifications, setNotifications, tasks, setTasks, updateTaskStatus, importContracts, isSyncing, automationRules, automationLogs, toggleAutomationRule, createAutomationRule, deleteAutomationRule } = useApp();

  const { isAuthenticated, loggedUser, handleLoginSuccess, handleLogout } = useAuthState();
  const { activeView, setActiveView, calculatorInitialValue, setCalculatorInitialValue } = useNavigationState(loggedUser);
  const { globalSearch, setGlobalSearch, debouncedSearch, filters, setFilters } = useFilterState();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncResult, setSyncResult] = useState<ImportSyncResult | null>(null);

  // ─── ENGINE DE IA: Especialista em Renegociação ──────────────────────────────
  const runIAAnalysis = useCallback((newContracts: Contract[]) => {
    const newTasks: Task[] = [];
    const newAlerts: AppNotification[] = [];

    newContracts.forEach(contract => {
      // Regra 1: Atraso Crítico (IA de Recuperação)
      if (contract.daysOverdue > 60 && contract.saldoDevedor > 30000) {
        newTasks.push({
          id: `IA-${Date.now()}-${contract.id}`,
          contractId: contract.id,
          contractClient: contract.clientName,
          managerEmail: contract.managerEmail,
          description: `[IA] Renegociação Estratégica: Score de risco elevado. Sugestão: Carência 60 dias + Redução de taxa para 1.2% a.m.`,
          status: TaskStatus.Pendente,
          priority: 1,
          creationDate: new Date().toLocaleString('pt-BR'),
          aiScore: 98
        });

        newAlerts.push({
          id: `notif-${Date.now()}-${contract.id}`,
          managerEmail: contract.managerEmail,
          type: 'URGENTE',
          message: `🔥 Alerta Preditivo: IA detectou alta probabilidade de default para ${contract.clientName}. Ação recomendada em 24h.`,
          timestamp: new Date().toLocaleString('pt-BR'),
          read: false
        });
      }
    });

    if (newTasks.length > 0) setTasks(prev => [...newTasks, ...prev]);
    if (newAlerts.length > 0) setNotifications(prev => [...newAlerts, ...prev]);
  }, [setTasks, setNotifications]);

  const [darkMode, setDarkMode] = useState<boolean>(() => { try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; } });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('darkMode', String(darkMode)); } catch { /* ignorado */ }
  }, [darkMode]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, [isAuthenticated, activeView]);

  // ─── Filtros de contratos por perfil ─────────────────────────────────────
  const baseVisibleContracts = useMemo(() => {
    if (!loggedUser) return [];
    if (loggedUser.role === UserRole.Admin || loggedUser.role === UserRole.Coordenador) return allContracts;
    const userPa = (loggedUser.pa || '').trim().toUpperCase();
    const userName = (loggedUser.name || '').trim().toUpperCase();
    return allContracts.filter((c) => c.pa.trim().toUpperCase() === userPa && c.gerente.trim().toUpperCase() === userName);
  }, [allContracts, loggedUser]);

  const filteredContracts = useMemo(() => {
    const paNorm = filters.pa !== 'Todas' ? filters.pa.trim().toUpperCase() : null;
    const gerenteNorm = filters.gerente !== 'Todos' ? filters.gerente.trim().toUpperCase() : null;
    const search = debouncedSearch ? debouncedSearch.toLowerCase() : null;
    return baseVisibleContracts.filter((c) => {
      if (search && !(c.clientName.toLowerCase().includes(search) || c.id.toLowerCase().includes(search) || c.cpfCnpj.includes(search))) return false;
      if (paNorm && c.pa.trim().toUpperCase() !== paNorm) return false;
      if (gerenteNorm && c.gerente.trim().toUpperCase() !== gerenteNorm) return false;
      if (filters.produto !== 'Todos' && c.product !== filters.produto) return false;
      return true;
    });
  }, [baseVisibleContracts, filters, debouncedSearch]);

  const totalSaldo = useMemo(() => filteredContracts.reduce((acc, c) => acc + (c.originSheet === 'Geral' ? c.saldoDevedor : 0), 0), [filteredContracts]);
  const handleMarkAllAsRead = useCallback(() => { setNotifications((prev: AppNotification[]) => prev.map((n) => ({ ...n, read: true }))); }, [setNotifications]);
  const navigateToDetails = useCallback((id: string) => { setGlobalSearch(id); setActiveView(VIEWS.DETALHAMENTO); }, [setGlobalSearch, setActiveView]);

  // ─── Callback de importação → dispara syncronização e exibe toast ─────────
  const handleDataImported = useCallback((newContracts?: Contract[]) => {
    if (newContracts && newContracts.length > 0) {
      const result = importContracts(newContracts);
      setSyncResult(result);
      runIAAnalysis(newContracts); // Dispara análise de especialista
      // Esconde o toast após 6 segundos
      setTimeout(() => setSyncResult(null), 6000);
    }
    setActiveView(VIEWS.DASHBOARD);
  }, [importContracts, setActiveView, runIAAnalysis]);

  if (!isAuthenticated || !loggedUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const viewsWithFilterBar: ViewName[] = [VIEWS.DASHBOARD, VIEWS.ANALISE_DINAMICA, VIEWS.DETALHAMENTO];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#f8faff] dark:bg-[#0f172a] transition-colors duration-500">
      {/* Toast de sincronização pós-importação */}
      <AnimatePresence>
        {syncResult && <SyncToast result={syncResult} onClose={() => setSyncResult(null)} />}
      </AnimatePresence>

      <Sidebar
        isOpen={sidebarOpen}
        activeView={activeView}
        setActiveView={(view: ViewName) => { setActiveView(view); setSidebarOpen(false); }}
        unreadNotificationCount={notifications.filter((n) => !n.read).length}
        pendingTaskCount={tasks.filter((t) => t.status === TaskStatus.Pendente).length}
        userRole={loggedUser.role}
        user={loggedUser}
        onLogout={handleLogout}
        allowedViews={ROLE_PERMISSIONS[loggedUser.role]}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((p) => !p)}
          currentUser={loggedUser}
          onLogout={handleLogout}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          onDataImported={handleDataImported}
        />

        <LetreiroDinamico filtros={filters} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          {viewsWithFilterBar.includes(activeView) && (
            <div className="px-10 pt-10"><FilterBar data={baseVisibleContracts} onFilterChange={setFilters} /></div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 space-y-6">
                <Skeleton className="h-[400px] w-full rounded-[4rem]" />
              </motion.div>
            ) : (
              <motion.div key={activeView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-10">
                {!canAccess(loggedUser.role, activeView) ? (
                  <AccessDenied role={loggedUser.role} />
                ) : (
                  <>
                    {activeView === VIEWS.DASHBOARD && (
                      <div className="space-y-16">
                        <Dashboard contracts={filteredContracts} filterName="Geral" onNavigateToDetails={navigateToDetails} isDarkMode={darkMode} userRole={loggedUser.role} />
                        <PredictiveAIAlerts contracts={filteredContracts} onNavigateToDetails={navigateToDetails} />
                      </div>
                    )}
                    {activeView === VIEWS.ANALISE_DINAMICA && (
                      <div className="space-y-8">
                        <AnaliseDinamicaPro contracts={filteredContracts} />
                        <AnaliseDinamicaView contracts={filteredContracts} />
                      </div>
                    )}
                    {activeView === VIEWS.IMPORTACAO && <ImportacaoView onDataImported={handleDataImported} contractCount={allContracts.length} />}
                    {activeView === VIEWS.INSIGHTS_IA && <InsightsIAView contracts={filteredContracts} onNavigateToDetails={navigateToDetails} />}
                    {activeView === VIEWS.DETALHAMENTO && <DetalhamentoView contracts={filteredContracts} initialSearchTerm={debouncedSearch} onNavigateToDetails={(id) => setGlobalSearch(id)} onSimulateRenegotiation={(val) => { setCalculatorInitialValue(val); setActiveView(VIEWS.CALCULADORA); }} userRole={loggedUser.role} />}
                    {activeView === VIEWS.GESTAO_TAREFAS && <GestaoTarefasView tasks={tasks} contracts={allContracts} onUpdateTaskStatus={updateTaskStatus} onNavigateToDetails={navigateToDetails} />}
                    {activeView === VIEWS.NOTIFICACOES && <NotificacoesView notifications={notifications} onNavigateToDetails={navigateToDetails} onMarkAllAsRead={handleMarkAllAsRead} />}
                    {activeView === VIEWS.CARTOES_ATRASO && <CartoesAtrasoView contracts={filteredContracts} isDarkMode={darkMode} onNavigateToDetails={navigateToDetails} />}
                    {activeView === VIEWS.CALCULADORA && <CalculadoraRenegociacaoView isDarkMode={darkMode} initialValue={calculatorInitialValue} />}
                    {activeView === VIEWS.ADMINISTRACAO && <AdministracaoView />}
                    {activeView === VIEWS.AUTOMACOES && (
                      <AutomacoesView 
                        rules={automationRules} 
                        logs={automationLogs} 
                        onToggleRule={toggleAutomationRule}
                        onCreateRule={createAutomationRule}
                        onDeleteRule={deleteAutomationRule}
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
