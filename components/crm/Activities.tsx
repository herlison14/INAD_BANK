
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Phone, 
  Mail, 
  Users, 
  CheckSquare, 
  Utensils, 
  Clock, 
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { MOCK_ACTIVITIES, CRMActivity, MOCK_CONTACTS, MOCK_DEALS } from '../../lib/crm-mock-data';

// Configuração do Localizador para o Calendário
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Activities: React.FC = () => {
  const [activities] = useState<CRMActivity[]>(MOCK_ACTIVITIES);
  const [view, setView] = useState<any>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    return activities.map(act => ({
      id: act.id,
      title: act.title,
      start: new Date(act.dueDate),
      end: addMinutes(new Date(act.dueDate), act.duration),
      resource: act,
    }));
  }, [activities]);

  const eventStyleGetter = (event: any) => {
    const act = event.resource as CRMActivity;
    let backgroundColor = '#10b981'; // emerald-500
    
    switch (act.type) {
      case 'call': backgroundColor = '#3b82f6'; break; // blue-500
      case 'meeting': backgroundColor = '#8b5cf6'; break; // violet-500
      case 'email': backgroundColor = '#f59e0b'; break; // amber-500
      case 'task': backgroundColor = '#64748b'; break; // slate-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '2px 6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header do Calendário Customizado */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic min-w-[180px] text-center">
              {format(date, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button 
              onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: Views.MONTH, label: 'Mês' },
              { id: Views.WEEK, label: 'Semana' },
              { id: Views.DAY, label: 'Dia' },
              { id: Views.AGENDA, label: 'Agenda' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  view === v.id 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
          <Plus className="w-4 h-4" />
          Agendar Atividade
        </button>
      </div>

      {/* Área do Calendário */}
      <div className="flex-1 p-8 overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          .rbc-calendar { font-family: inherit; }
          .rbc-header { padding: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; border-bottom: 2px solid #f1f5f9; }
          .rbc-month-view { border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; background: white; }
          .rbc-day-bg { border-left: 1px solid #f1f5f9; }
          .rbc-off-range-bg { background: #f8fafc; }
          .rbc-today { background: #f0fdf4; }
          .rbc-event { transition: all 0.2s; }
          .rbc-event:hover { transform: scale(1.02); z-index: 10; }
          .dark .rbc-month-view { background: #0f172a; border-color: #1e293b; }
          .dark .rbc-day-bg { border-color: #1e293b; }
          .dark .rbc-header { border-color: #1e293b; color: #94a3b8; }
          .dark .rbc-off-range-bg { background: #020617; }
          .dark .rbc-today { background: #064e3b/20; }
        `}} />
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          culture="pt-BR"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há eventos neste período."
          }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: ({ event }: any) => {
              const act = event.resource as CRMActivity;
              return (
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {act.type === 'call' && <Phone className="w-2.5 h-2.5" />}
                  {act.type === 'meeting' && <Users className="w-2.5 h-2.5" />}
                  {act.type === 'email' && <Mail className="w-2.5 h-2.5" />}
                  {act.type === 'task' && <CheckSquare className="w-2.5 h-2.5" />}
                  <span className="truncate">{event.title}</span>
                </div>
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default Activities;
