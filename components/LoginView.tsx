
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { users, addAuditLog } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
      const normalizedInput = email.toLowerCase().trim();
      
      // Validação Especial para Administrador Master
      if (normalizedInput === 'admin@admin' && password === '123') {
        const adminUser = users.find(u => u.email === 'admin@admin') || {
          id: 'admin-master',
          name: 'ADMINISTRADOR MASTER',
          email: 'admin@admin',
          role: UserRole.Admin,
          pa: 'GLOBAL'
        };
        addAuditLog(adminUser.email, 'LOGIN', 'Acesso MASTER autorizado via bypass centralizado.');
        onLoginSuccess(adminUser);
        return;
      }

      // Validação para demais usuários (Gerentes importados)
      const user = users.find(u => 
        u.email.toLowerCase() === normalizedInput || 
        u.name.toUpperCase() === normalizedInput.toUpperCase()
      );

      const isCorrectPassword = (password === '123') || (user?.password && password === user.password);

      if (user && isCorrectPassword) {
        addAuditLog(user.email, 'LOGIN', `Acesso autorizado ao ambiente auditado via cargo ${user.role}.`);
        onLoginSuccess(user);
      } else {
        setError('Acesso Negado. Identidade ou Token inválidos no diretório.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-950 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#1a1f2e]/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border-2 border-white/10 shadow-none ring-1 ring-[#2e3347] relative z-10 animate-fade-in-up box-glow">
        <div className="text-center mb-12">
          <div className="inline-flex p-6 bg-emerald-600 rounded-[2.5rem] mb-8 shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-500/10">
            <FeatherIcon name="shield" className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">PAINEL <span className="text-emerald-500">INAD 1.0</span></h1>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-4 opacity-80">Ambiente Auditado Sicoob</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-[#a0aec0] ml-2 tracking-[0.2em]">Identidade (admin@admin)</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#718096] group-focus-within:text-blue-500 transition-colors">
                <FeatherIcon name="user" className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                required
                className="w-full h-18 pl-16 bg-[#242938] border-2 border-white/5 rounded-3xl text-[#f0f4ff] focus:border-blue-500 transition-all outline-none font-bold text-lg"
                placeholder="Ex: admin@admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-[#a0aec0] ml-2 tracking-[0.2em]">Token de Acesso (123)</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#718096] group-focus-within:text-blue-500 transition-colors">
                <FeatherIcon name="lock" className="w-5 h-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full h-18 pl-16 pr-16 bg-[#242938] border-2 border-white/5 rounded-3xl text-[#f0f4ff] focus:border-blue-500 transition-all outline-none font-mono tracking-widest text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#718096] hover:text-white transition-colors"
              >
                <FeatherIcon name={showPassword ? "sun" : "moon"} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center italic tracking-widest">
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Painel
                <FeatherIcon name="zap" className="w-5 h-5" />
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={() => { setEmail('admin@admin'); setPassword('123'); }}
            className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-[#718096] hover:text-blue-400 transition-colors border border-white/5 rounded-2xl"
          >
            Preencher Acesso Master
          </button>
        </form>

        <div className="mt-12 p-8 bg-blue-500/5 rounded-[2.5rem] border border-white/5 space-y-4">
          <p className="text-[9px] text-[#718096] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-4">Protocolos Auditados:</p>
          <div className="grid grid-cols-2 gap-6 text-[8px] text-[#a0aec0] font-bold uppercase">
            <div className="space-y-1">
              <p className="text-blue-400 mb-2 font-black italic">ADMINISTRADOR</p>
              <p>User: admin@admin</p>
              <p>Pass: 123</p>
            </div>
            <div className="space-y-1">
              <p className="text-blue-400 mb-2 font-black italic">GERENTE PLANILHA</p>
              <p>User: [Nome Col B]</p>
              <p>Pass: 123</p>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[7px] text-[#718096] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <FeatherIcon name="shield" className="w-3 h-3" />
            SISTEMA INTEGRADO RECOVERY
        </p>
      </div>
    </div>
  );
};

export default LoginView;
