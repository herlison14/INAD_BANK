
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Plus, 
  Building2, 
  Tag, 
  ExternalLink,
  MessageSquare,
  Linkedin,
  MapPin
} from 'lucide-react';
import { MOCK_CONTACTS, MOCK_ORGANIZATIONS, CRMContact } from '../../lib/crm-mock-data';

interface ContactsProps {
  searchTerm: string;
}

const Contacts: React.FC<ContactsProps> = ({ searchTerm }) => {
  const [contacts] = useState<CRMContact[]>(MOCK_CONTACTS);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Barra de Ações Local */}
      <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {filteredContacts.length} Contatos Encontrados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            Exportar CSV
          </button>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Novo Contato
          </button>
        </div>
      </div>

      {/* Tabela de Contatos */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nome</th>
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Empresa</th>
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail</th>
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Telefone</th>
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Score</th>
              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Tags</th>
              <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => {
              const company = MOCK_ORGANIZATIONS.find(o => o.id === contact.companyId);
              return (
                <tr key={contact.id} className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-500/10">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{contact.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{contact.jobTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {company?.name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {contact.phone}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            contact.engagementScore > 70 ? 'bg-emerald-500' :
                            contact.engagementScore > 40 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${contact.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">{contact.engagementScore}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;
