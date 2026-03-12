
import React from 'react';
import { useApp } from '../context/AppContext';

const ContatosView: React.FC = () => {
  const { contacts } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contatos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2e3347] hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{contact.name}</h3>
                <p className="text-sm text-slate-400">{contact.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Telefone: <span className="text-white">{contact.phone || 'N/A'}</span></p>
              <p className="text-xs text-slate-400">Score: <span className="text-blue-400 font-bold">{contact.engagementScore}%</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContatosView;
