
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

const AdministracaoView: React.FC = () => {
  const { users, setUsers } = useApp();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'pipeline' | 'seguranca'>('usuarios');
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.Salesperson,
    password: '123'
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: UserRole.Salesperson, password: '123' });
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
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userFormData } as User : u));
    } else {
      const newUser: User = { ...userFormData as User, id: `user-${Date.now()}` };
      setUsers(prev => [...prev, newUser]);
    }
    setIsUserFormOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Deseja realmente excluir este usuário?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#2e3347] pb-10">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">Administração <span className="text-blue-500">do Sistema</span></h2>
          <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
            <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
            CONFIGURAÇÕES GERAIS E CONTROLE DE ACESSO
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'usuarios', label: 'Gestão de Usuários', icon: 'users' },
          { id: 'pipeline', label: 'Configuração de Funil', icon: 'layers' },
          { id: 'seguranca', label: 'Segurança e Logs', icon: 'shield' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30' 
                : 'bg-[#1a1f2e] text-slate-400 border-2 border-[#2e3347] hover:border-blue-500/30'
            }`}
          >
            <FeatherIcon name={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[#1a1f2e] rounded-[3rem] border border-[#2e3347] shadow-2xl overflow-hidden min-h-[500px]">
          
          {activeTab === 'usuarios' && (
             <div className="p-0">
                <div className="p-10 border-b border-[#2e3347] flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Usuários e Permissões</h3>
                  <button onClick={handleOpenCreate} className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl">
                    <FeatherIcon name="plus" className="w-4 h-4" /> Novo Usuário
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#0f1117] text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="px-10 py-6">Nome</th>
                        <th className="px-10 py-6">E-mail</th>
                        <th className="px-10 py-6">Cargo</th>
                        <th className="px-10 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e3347]">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-[#242938] transition-colors">
                          <td className="px-10 py-6 font-bold text-white uppercase text-sm">{user.name}</td>
                          <td className="px-10 py-6 text-slate-400 text-sm">{user.email}</td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${
                                user.role === UserRole.Admin ? 'bg-purple-500/20 text-purple-400' :
                                user.role === UserRole.Manager ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                            }`}>{user.role}</span>
                          </td>
                          <td className="px-10 py-6 text-right space-x-2">
                             <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                                <FeatherIcon name="edit-3" className="w-4 h-4" /> 
                             </button>
                             <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
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

          {activeTab === 'pipeline' && (
            <div className="p-12 text-center">
                <FeatherIcon name="settings" className="w-16 h-16 mx-auto text-slate-700 mb-6" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">Configuração de Etapas</h3>
                <p className="text-slate-500 max-w-md mx-auto">Em breve: Personalize as etapas do seu funil de vendas, defina probabilidades e cores para cada estágio.</p>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="p-12 text-center">
                <FeatherIcon name="shield" className="w-16 h-16 mx-auto text-slate-700 mb-6" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">Logs de Auditoria</h3>
                <p className="text-slate-500 max-w-md mx-auto">Em breve: Acompanhe todas as alterações críticas realizadas no sistema por cada usuário.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isUserFormOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsUserFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} className="relative w-full max-w-md bg-[#1a1f2e] h-full p-12 overflow-y-auto border-l border-[#2e3347]">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-12">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <form onSubmit={handleSaveUser} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Nome Completo</label>
                      <input required type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full p-5 bg-[#0f1117] border-2 border-[#2e3347] text-white rounded-3xl outline-none focus:border-blue-500 font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">E-mail</label>
                      <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full p-5 bg-[#0f1117] border-2 border-[#2e3347] text-white rounded-3xl outline-none focus:border-blue-500 font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Cargo / Perfil</label>
                      <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full p-5 bg-[#0f1117] border-2 border-[#2e3347] text-white rounded-3xl outline-none focus:border-blue-500 font-bold">
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                   </div>
                   <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl shadow-blue-500/30">Salvar Alterações</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdministracaoView;
