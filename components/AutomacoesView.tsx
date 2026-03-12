
import React from 'react';
import FeatherIcon from './FeatherIcon';

const AutomacoesView: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in max-w-[1000px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Automações <span className="text-blue-500">Inteligentes</span></h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Otimize seu fluxo de trabalho com regras automáticas</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl">
          <FeatherIcon name="plus" className="w-4 h-4" /> Criar Automação
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[
          { title: 'Boas-vindas Automático', desc: 'Enviar e-mail quando um novo negócio for criado na etapa de Prospecção.', icon: 'mail', active: true },
          { title: 'Alerta de Inatividade', desc: 'Notificar o gestor se um negócio ficar mais de 5 dias sem movimentação.', icon: 'clock', active: true },
          { title: 'Follow-up de Proposta', desc: 'Criar tarefa de ligação 2 dias após o envio da proposta comercial.', icon: 'phone', active: false },
        ].map((rule, i) => (
          <div key={i} className="bg-[#1a1f2e] p-8 rounded-[3rem] border border-[#2e3347] flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${rule.active ? 'bg-blue-600 text-white' : 'bg-[#2e3347] text-slate-500'}`}>
                <FeatherIcon name={rule.icon} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">{rule.title}</h4>
                <p className="text-slate-400 text-sm max-w-md">{rule.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${rule.active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rule.active ? 'right-1' : 'left-1'}`}></div>
               </div>
               <button className="p-2 text-slate-500 hover:text-white">
                  <FeatherIcon name="more-vertical" className="w-5 h-5" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomacoesView;
