'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FeatherIcon from './FeatherIcon';

const DesignSystemView: React.FC = () => {
  const tokens = [
    {
      name: 'surface-background',
      description: 'Fundo principal da aplicação',
      light: '#F8FAFF',
      dark: '#121212',
      variable: 'var(--surface-background)',
    },
    {
      name: 'surface-container',
      description: 'Cards, menus e containers (Nível 1)',
      light: '#FFFFFF',
      dark: '#1E1E1E',
      variable: 'var(--surface-container)',
    },
    {
      name: 'surface-elevated',
      description: 'Modais, tooltips e popups (Nível 2)',
      light: '#FFFFFF',
      dark: '#2C2C2C',
      variable: 'var(--surface-elevated)',
    },
    {
      name: 'text-primary',
      description: 'Texto principal e títulos',
      light: '#1E293B',
      dark: '#F5F5F5',
      variable: 'var(--text-primary)',
    },
    {
      name: 'text-secondary',
      description: 'Texto de apoio e legendas',
      light: '#64748B',
      dark: '#A0A0A0',
      variable: 'var(--text-secondary)',
    },
    {
      name: 'border-default',
      description: 'Divisores e bordas de elementos',
      light: '#E2E8F0',
      dark: '#333333',
      variable: 'var(--border-default)',
    },
    {
      name: 'brand-primary',
      description: 'Cor de ação principal (Desaturada no Dark)',
      light: '#2563EB',
      dark: '#60A5FA',
      variable: 'var(--brand-primary)',
    },
    {
      name: 'status-error',
      description: 'Alertas e estados de erro',
      light: '#EF4444',
      dark: '#F87171',
      variable: 'var(--status-error)',
    },
    {
      name: 'status-success',
      description: 'Confirmações e estados de sucesso',
      light: '#10B981',
      dark: '#34D399',
      variable: 'var(--status-success)',
    },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
          Design System: <span className="text-blue-600 dark:text-blue-400">Dark Mode Strategy</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl">
          Conversão profissional focada em acessibilidade (WCAG 2.1), conforto visual e profundidade semântica.
          Utilizamos elevação tonal em vez de sombras e cores dessaturadas para evitar vibração cromática.
        </p>
      </header>

      {/* Elevation Guide */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FeatherIcon name="layers" className="w-6 h-6 text-blue-500" />
          Regra da Elevação (Elevation)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#F8FAFF] dark:bg-[#121212] border border-slate-200 dark:border-white/5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">Nível 0: Background</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fundo base da aplicação. Cinza profundo para evitar smearing em OLED.</p>
            <code className="mt-4 block text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded">#121212</code>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-md">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">Nível 1: Container</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cards e menus. Tom levemente mais claro para indicar proximidade.</p>
            <code className="mt-4 block text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded">#1E1E1E</code>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] border border-slate-200 dark:border-white/5 shadow-xl">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">Nível 2: Elevated</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Modais e popups. O ponto mais claro da interface escura.</p>
            <code className="mt-4 block text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded">#2C2C2C</code>
          </div>
        </div>
      </section>

      {/* Token Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FeatherIcon name="table" className="w-6 h-6 text-emerald-500" />
          Mapeamento Semântico de Tokens
        </h2>
        <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Token</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Light Mode</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Dark Mode</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.name} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{token.name}</span>
                      <code className="text-[10px] text-slate-400 font-mono">{token.variable}</code>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: token.light }} />
                      <span className="text-xs font-mono text-slate-500">{token.light}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: token.dark }} />
                      <span className="text-xs font-mono text-slate-400">{token.dark}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{token.description}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Accessibility Tips */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-lg font-black text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
            <FeatherIcon name="eye" className="w-5 h-5" />
            Conforto Visual
          </h3>
          <ul className="space-y-3 text-sm text-blue-800/70 dark:text-blue-400/70">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Evite branco puro (#FFFFFF) sobre fundos escuros para reduzir o efeito de "halo".
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Utilize opacidade em vez de cores sólidas para estados de hover (ex: white/5).
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Aumente levemente o peso da fonte (font-weight) se o contraste parecer baixo em telas pequenas.
            </li>
          </ul>
        </div>
        <div className="p-8 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
          <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
            <FeatherIcon name="check-circle" className="w-5 h-5" />
            Acessibilidade WCAG
          </h3>
          <ul className="space-y-3 text-sm text-emerald-800/70 dark:text-emerald-400/70">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              Contraste mínimo de 4.5:1 para texto normal.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              Contraste de 3:1 para elementos gráficos e componentes de UI.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              Não dependa apenas da cor para transmitir status (use ícones e labels).
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemView;
