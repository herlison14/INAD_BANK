
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';
import { useManagerActions } from '../hooks/useManagerActions';

const AdministracaoView: React.FC = () => {
  const { users, setUsers } = useApp();
  const { deleteManager, isSyncing } = useManagerActions();
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showSecurityReport, setShowSecurityReport] = useState(false);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPA, setUserPA] = useState('PA Centro');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Gerente);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }, [password]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !password.trim()) {
        setFormError('Todos os campos são obrigatórios.');
        return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      password: password, 
      pa: userRole === UserRole.Admin ? undefined : userPA,
    };
    setUsers([...users, newUser]);
    setShowNewUserModal(false);
    setUserName('');
    setUserEmail('');
    setPassword('');
  };

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 dark:border-gray-800 pb-10">
        <div>
          <h2 className="text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">Governança</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
            <div className={`w-4 h-1 ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-blue-600'} rounded-full`}></div>
            {isSyncing ? 'Sincronizando...' : 'CONTROLE DE IDENTIDADE E COMPLIANCE'}
          </p>
        </div>
        <button 
            onClick={() => setShowNewUserModal(true)}
            className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
        >
            <FeatherIcon name="plus" className="h-4 w-4" />
            Novo Operador
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Operadores Ativos</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Registros</span>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence mode='popLayout'>
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 uppercase italic">
                            {user.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{user.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">
                                {user.pa || 'GLOBAL'} • {user.role}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                              if(confirm(`Excluir ${user.name}?`)) deleteManager(user.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FeatherIcon name="trash-2" className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6">
                <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <FeatherIcon name="zap" className="text-amber-500" /> Segurança RLS
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                    A segregação de dados Row-Level Security está ativa. Gerentes visualizam apenas contratos vinculados ao seu Posto de Atendimento.
                </p>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[9px] text-blue-300">
                    WHERE (role = 'Admin' OR pa = user.pa)
                </div>
            </div>
        </div>
      </div>

      {showNewUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">Cadastrar Operador</h3>
             </div>
             <form onSubmit={handleAddUser} className="p-10 space-y-4">
                <input type="text" placeholder="Nome" value={userName} onChange={e=>setUserName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold" />
                <input type="email" placeholder="E-mail" value={userEmail} onChange={e=>setUserEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold" />
                <select value={userRole} onChange={e=>setUserRole(e.target.value as UserRole)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold">
                    <option value={UserRole.Gerente}>Gerente</option>
                    <option value={UserRole.Admin}>Administrador</option>
                </select>
                <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold" />
                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={()=>setShowNewUserModal(false)} className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                    <button type="submit" className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Salvar</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdministracaoView;
