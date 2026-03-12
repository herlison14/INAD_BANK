
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Briefcase, 
  MoreHorizontal, 
  Plus,
  ExternalLink,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { MOCK_ORGANIZATIONS, MOCK_CONTACTS, MOCK_DEALS, CRMOrganization } from '../../lib/crm-mock-data';

interface OrganizationsProps {
  searchTerm: string;
}

const Organizations: React.FC<OrganizationsProps> = ({ searchTerm }) => {
  const [organizations] = useState<CRMOrganization[]>(MOCK_ORGANIZATIONS);

  const filteredOrgs = useMemo(() => {
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Barra de Ações Local */}
      <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {filteredOrgs.length} Empresas Encontradas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            Importar Planilha
          </button>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Grid de Empresas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => {
            const contactCount = MOCK_CONTACTS.filter(c => c.companyId === org.id).length;
            const dealCount = MOCK_DEALS.filter(d => d.companyId === org.id).length;
            const totalDealValue = MOCK_DEALS.filter(d => d.companyId === org.id).reduce((acc, d) => acc + d.value, 0);

            return (
              <div key={org.id} className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:border-emerald-500/30 transition-all relative overflow-hidden">
                {/* Background Decorativo */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-2">
                    {org.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">{org.sector}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">{org.size}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a href={`https://${org.website}`} target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                      {org.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {org.address}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contatos</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-black text-slate-900 dark:text-white">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      {contactCount}
                    </div>
                  </div>
                  <div className="text-center border-x border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Negócios</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-black text-slate-900 dark:text-white">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                      {dealCount}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {(totalDealValue / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Organizations;
