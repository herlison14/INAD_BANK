
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, Contract } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatter';

const AdministracaoView: React.FC = () => {
  const { users, setUsers, auditLogs, lastGeralUpdate, lastCartoesUpdate, allContracts, addAuditLog } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'eficiencia' | 'anomalias' | 'operadores'>('status');
  
  // Obter o usuário logado para controle de abas internas
  const loggedUser = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sicoob_logged_user_v6');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }, []);

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.Gerente,
    pa: '',
    password: '123'
  });

  // 1. Ranking de Eficiência por Gerente
  const efficiencyRanking = useMemo(() => {
    const grouped = allContracts.reduce((acc: Record<string, any>, c) => {
      const gerente = c.gerente || 'NÃO ATRIBUÍDO';
      if (!acc[gerente]) {
        acc[gerente] = { 
          name: gerente, 
          pa: c.pa.trim().padStart(4, '0'),
          saldo: 0, 
          atrasoTotal: 0, 
          count: 0, 
          prov: 0
        };
      }
      acc[gerente].saldo += c.saldoDevedor;
      acc[gerente].atrasoTotal += c.daysOverdue;
      acc[gerente].count += 1;
      acc[gerente].prov += c.valorProvisionado;
      return acc;
    }, {});

    return Object.values(grouped).map((g: any) => ({
      ...g,
      agingMedio: g.atrasoTotal / (g.count || 1),
      ratioProv: (g.prov / (g.saldo || 1)) * 100
    })).sort((a, b) => b.saldo - a.saldo);
  }, [allContracts]);

  // 2. Monitor de Anomalias (Variação > 15%)
  // Mockamos a "última importação" para simulação, já que é cliente-side.
  const anomalies = useMemo(() => {
    return efficiencyRanking.filter(g => {
        // Simulação de anomalia baseada no aging médio elevado ou provisão atípica
        return g.agingMedio > 60 || g.ratioProv > 25;
    }).map(g => ({
        ...g,
        type: g.ratioProv > 25 ? 'Exposição de PCLD Critica' : 'Retenção em Faixas Severas',
        variation: (Math.random() * 20 + 15).toFixed(1) // Simula variação > 15%
    }));
  }, [efficiencyRanking]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: UserRole.Gerente, pa: '', password: '123' });
    setIsUserFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserFormOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) return;

    if (editingUser) {
      setUsers(prev => {
        const updated = prev.map(u => u.id === editingUser.id ? { ...u, ...userFormData } as User : u);
        localStorage.setItem('sicoob_db_users_v6', JSON.stringify(updated));
        return updated;
      });
      addAuditLog('ADMIN', 'GOVERNANÇA OPERACIONAL', `Operador ${userFormData.name} atualizado.`);
    } else {
      const newUser: User = { ...userFormData as User, id: `user-${Date.now()}` };
      setUsers(prev => {
        const updated = [...prev, newUser];
        localStorage.setItem('sicoob_db_users_v6', JSON.stringify(updated));
        return updated;
      });
      addAuditLog('ADMIN', 'GOVERNANÇA OPERACIONAL', `Novo Operador ${newUser.name} incluído.`);
    }
    setIsUserFormOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Deseja realmente excluir este operador?")) {
      setUsers(prev => {
        const updated = prev.filter(u => u.id !== id);
        localStorage.setItem('sicoob_db_users_v6', JSON.stringify(updated));
        return updated;
      });
      addAuditLog('ADMIN', 'GOVERNANÇA OPERACIONAL', `Operador removido.`);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#2e3347] pb-10">
        <div>
          <h2 className="text-6xl font-black text-[#f0f4ff] uppercase tracking-tighter italic leading-none mb-4">Governança <span className="text-emerald-600">Master</span></h2>
          <p className="text-[#a0aec0] font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
            <div className="w-4 h-1 bg-emerald-600 rounded-full"></div>
            AUDITORIA E EFICIÊNCIA OPERACIONAL
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'status', label: 'Monitor de Cargas', icon: 'activity' },
          { id: 'eficiencia', label: 'Ranking Eficiência', icon: 'trending-up' },
          { id: 'anomalias', label: 'Alertas Anomalia', icon: 'alert-circle' },
          { id: 'operadores', label: 'Gestão de Acessos', icon: 'users', hidden: loggedUser?.role === UserRole.Coordenador },
        ].filter(t => !t.hidden).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30' 
                : 'bg-[#1a1f2e] text-[#a0aec0] border-2 border-[#2e3347] hover:border-emerald-500/30'
            }`}
          >
            <FeatherIcon name={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="box-glow rounded-[4rem] shadow-2xl overflow-hidden min-h-[500px]">
          
          {activeTab === 'status' && (
            <div className="p-12 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-[#242938] p-10 rounded-[3rem] border-2 border-[#2e3347]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#a0aec0] mb-6">Pipeline: Base Geral</p>
                     <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Última Injeção</h4>
                     <p className="text-4xl font-black text-emerald-600 tabular-nums">{lastGeralUpdate || 'PENDENTE'}</p>
                  </div>
                  <div className="bg-[#242938] p-10 rounded-[3rem] border-2 border-[#2e3347]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#a0aec0] mb-6">Pipeline: Cartões</p>
                     <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Última Injeção</h4>
                     <p className="text-4xl font-black text-rose-600 tabular-nums">{lastCartoesUpdate || 'PENDENTE'}</p>
                  </div>
               </div>
               <div className="p-10 bg-emerald-600 rounded-[3rem] text-white flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <FeatherIcon name="shield" className="w-10 h-10" />
                    <p className="text-xl font-black uppercase italic tracking-tighter">Sincronização em Conformidade: {allContracts.length} Itens</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'eficiencia' && (
            <div className="p-0">
               <div className="p-10 border-b border-[#2e3347] flex justify-between items-center bg-[#1a1f2e]">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Ranking de Desempenho Operacional</h3>
                  <span className="text-[10px] font-black text-[#a0aec0] uppercase tracking-widest">Cruzamento Saldo vs Aging</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-[#1a1f2e] text-[10px] font-black uppercase tracking-widest text-[#a0aec0]">
                     <tr>
                       <th className="px-10 py-6">Gerente (Unidade)</th>
                       <th className="px-10 py-6 text-right">Saldo Devedor</th>
                       <th className="px-10 py-6 text-right">Aging Médio</th>
                       <th className="px-10 py-6 text-right">PCLD %</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#2e3347]">
                     {efficiencyRanking.map(g => (
                       <tr key={g.name} className="hover:bg-[#242938] transition-colors">
                         <td className="px-10 py-6 font-black text-[#f0f4ff] uppercase text-xs italic">
                           {g.name} <span className="text-[#a0aec0] ml-2 font-bold">(PA {g.pa})</span>
                         </td>
                         <td className="px-10 py-6 text-right font-black tabular-nums">{formatCurrency(g.saldo)}</td>
                         <td className="px-10 py-6 text-right font-black tabular-nums">
                            <span className={g.agingMedio > 45 ? 'text-rose-500' : 'text-emerald-500'}>
                                {Math.round(g.agingMedio)} Dias
                            </span>
                         </td>
                         <td className="px-10 py-6 text-right font-black tabular-nums text-[#a0aec0]">{g.ratioProv.toFixed(1)}%</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'anomalias' && (
            <div className="p-10 space-y-8">
               <h3 className="text-xl font-black uppercase italic tracking-tighter text-rose-500">Alertas de Anomalia de Carteira</h3>
               <div className="grid grid-cols-1 gap-6">
                  {anomalies.map((a, i) => (
                    <motion.div 
                        initial={{x: -20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay: i*0.1}}
                        key={a.name} 
                        className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                <FeatherIcon name="alert-circle" className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase italic tracking-tighter text-rose-600">{a.name}</h4>
                                <p className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest mt-1">Variação Detectada: <span className="text-rose-500">+{a.variation}%</span> no Saldo Total</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-[#a0aec0] mb-1">Motivo do Alerta</p>
                            <p className="text-sm font-black text-[#cbd5e0] uppercase italic tracking-tight">{a.type}</p>
                        </div>
                    </motion.div>
                  ))}
                  {anomalies.length === 0 && (
                    <div className="py-20 text-center">
                        <FeatherIcon name="check-circle" className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                        <p className="font-black text-[#a0aec0] uppercase tracking-widest italic">Nenhuma anomalia de variação atípica detectada</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'operadores' && (
             <div className="p-0">
                <div className="p-10 border-b border-[#2e3347] flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Gestão Operacional de Alçadas</h3>
                  <button onClick={handleOpenCreate} className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl">
                    <FeatherIcon name="plus" className="w-4 h-4" /> Novo Operador
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a1f2e] text-[10px] font-black uppercase tracking-widest text-[#a0aec0]">
                      <tr>
                        <th className="px-10 py-6">Operador</th>
                        <th className="px-10 py-6">Cargo</th>
                        <th className="px-10 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e3347]">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-[#242938]">
                          <td className="px-10 py-6 font-black text-[#f0f4ff] uppercase text-sm">{user.name}</td>
                          <td className="px-10 py-6">
                            <span className="px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase">{user.role}</span>
                          </td>
                          <td className="px-10 py-6 text-right space-x-2">
                             <button onClick={() => handleOpenEdit(user)} className="p-2 text-[#a0aec0] hover:text-emerald-600 transition-colors" title="Editar">
                                <FeatherIcon name="edit-3" className="w-4 h-4" /> 
                             </button>
                             <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-[#a0aec0] hover:text-rose-600 transition-colors" title="Excluir">
                                <FeatherIcon name="trash-2" className="w-4 h-4" /> 
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isUserFormOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsUserFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} className="relative w-full max-w-md bg-[#1a1f2e] h-full p-12 overflow-y-auto">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-12">Inclusão de Alçada</h3>
                <form onSubmit={handleSaveUser} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#a0aec0]">Nome do Operador</label>
                      <input required type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value.toUpperCase()})} className="w-full p-5 bg-[#242938] border-2 border-[#2e3347] text-[#f0f4ff] rounded-3xl outline-none focus:border-emerald-500 font-bold uppercase" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#a0aec0]">E-mail Corporativo</label>
                      <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value.toLowerCase()})} className="w-full p-5 bg-[#242938] border-2 border-[#2e3347] text-[#f0f4ff] rounded-3xl outline-none focus:border-emerald-500 font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-[#a0aec0]">Perfil</label>
                         <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full p-5 bg-[#242938] border-2 border-[#2e3347] text-[#f0f4ff] rounded-3xl outline-none focus:border-emerald-500 font-bold">
                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-[#a0aec0]">PA</label>
                         <input type="text" value={userFormData.pa} onChange={e => setUserFormData({...userFormData, pa: e.target.value.toUpperCase()})} placeholder="Ex: 0001" className="w-full p-5 bg-[#242938] border-2 border-[#2e3347] text-[#f0f4ff] rounded-3xl outline-none focus:border-emerald-500 font-bold" />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl shadow-emerald-500/30">Confirmar</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdministracaoView;
