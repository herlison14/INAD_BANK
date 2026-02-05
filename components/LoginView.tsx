
import React, { useState } from 'react';
// Added missing motion import for animations
import { motion } from 'framer-motion';
import { User, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Motor de Autenticação Corporativa (Mecanismo de Auditoria)
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Busca usuário por email ou pelo Nome (facilitando login de novos gerentes)
      const user = users.find(u => 
        u.email.toLowerCase() === normalizedEmail || 
        u.name.toLowerCase() === normalizedEmail
      );

      // Verificação de senha de protocolo ou personalizada
      const isCorrectPassword = (password === '123') || (user?.password && password === user.password);

      if (user && isCorrectPassword) {
        onLoginSuccess(user);
      } else {
        setError('Acesso Negado. Identidade não encontrada no diretório auditado.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      {/* Background VFX */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-950 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex p-6 bg-blue-600 rounded-[2.5rem] mb-8 shadow-2xl shadow-blue-500/40 ring-8 ring-blue-500/10">
            <FeatherIcon name="shield" className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">BI RECOVERY</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] mt-4 opacity-80">Ambiente Auditado Sicoob</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Identidade (E-mail ou Nome)</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <FeatherIcon name="user" className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                required
                className="w-full h-18 pl-16 bg-white/5 border-2 border-white/5 rounded-3xl text-white focus:border-blue-500 transition-all outline-none font-bold text-lg"
                placeholder="nome.gerente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Token de Acesso</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <FeatherIcon name="lock" className="w-5 h-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full h-18 pl-16 pr-16 bg-white/5 border-2 border-white/5 rounded-3xl text-white focus:border-blue-500 transition-all outline-none font-mono tracking-widest text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
            className="w-full h-20 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no BI
                <FeatherIcon name="zap" className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 p-8 bg-blue-500/5 rounded-[2.5rem] border border-white/5 space-y-4">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-4">Protocolos Auditados:</p>
          <div className="grid grid-cols-2 gap-6 text-[8px] text-slate-400 font-bold uppercase">
            <div className="space-y-1">
              <p className="text-blue-400 mb-2 font-black italic">ADMINISTRADOR</p>
              <p>User: admin@admin</p>
              <p>Pass: 123</p>
            </div>
            <div className="space-y-1">
              <p className="text-blue-400 mb-2 font-black italic">GERENTE PLANILHA</p>
              <p>User: [Nome na Col B]</p>
              <p>Pass: mudar123</p>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[7px] text-slate-600 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <FeatherIcon name="shield" className="w-3 h-3" />
            SISTEMA INTEGRADO RECOVERY
        </p>
      </div>
    </div>
  );
};

export default LoginView;
