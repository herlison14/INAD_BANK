
'use client';

import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  MoreVertical, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MOCK_STAGES, MOCK_DEALS, CRMDeal, CRMStage, MOCK_CONTACTS, MOCK_ORGANIZATIONS } from '../../lib/crm-mock-data';

interface PipelineProps {
  searchTerm: string;
}

const Pipeline: React.FC<PipelineProps> = ({ searchTerm }) => {
  const [deals, setDeals] = useState<CRMDeal[]>(MOCK_DEALS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deals, searchTerm]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, CRMDeal[]> = {};
    MOCK_STAGES.forEach(stage => {
      map[stage.id] = filteredDeals.filter(deal => deal.stageId === stage.id);
    });
    return map;
  }, [filteredDeals]);

  const stageTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    MOCK_STAGES.forEach(stage => {
      totals[stage.id] = dealsByStage[stage.id].reduce((acc, deal) => acc + deal.value, 0);
    });
    return totals;
  }, [dealsByStage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    // Se arrastou sobre uma coluna ou sobre um card em outra coluna
    const overStageId = MOCK_STAGES.some(s => s.id === overId) 
      ? overId 
      : deals.find(d => d.id === overId)?.stageId;

    if (overStageId && activeDeal.stageId !== overStageId) {
      setDeals(prev => prev.map(d => 
        d.id === activeId ? { ...d, stageId: overStageId } : d
      ));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="h-full p-8 overflow-x-auto bg-slate-50 dark:bg-slate-950">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full min-w-max">
          {MOCK_STAGES.map(stage => (
            <div key={stage.id} className="w-80 flex flex-col h-full">
              {/* Header da Coluna */}
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                    {stage.name}
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-[9px] font-bold text-slate-500">
                      {dealsByStage[stage.id].length}
                    </span>
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {stageTotals[stage.id].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              {/* Área de Drop */}
              <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl p-3 border-2 border-dashed border-transparent hover:border-emerald-500/20 transition-all overflow-y-auto custom-scrollbar">
                <SortableContext
                  id={stage.id}
                  items={dealsByStage[stage.id].map(d => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[100px]">
                    {dealsByStage[stage.id].map(deal => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <DealCard deal={deals.find(d => d.id === activeId)!} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

interface DealCardProps {
  deal: CRMDeal;
  isOverlay?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const contact = MOCK_CONTACTS.find(c => c.id === deal.contactId);
  const company = MOCK_ORGANIZATIONS.find(o => o.id === deal.companyId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all cursor-grab active:cursor-grabbing group ${isOverlay ? 'shadow-2xl ring-2 ring-emerald-500 rotate-2' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-emerald-500 transition-colors">
          {deal.title}
        </h4>
        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
          deal.probability > 60 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
          deal.probability > 30 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {deal.probability}%
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 dark:text-slate-400">
          <Building2 className="w-3 h-3" />
          {company?.name}
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 dark:text-slate-400">
          <User className="w-3 h-3" />
          {contact?.name}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
          <DollarSign className="w-3 h-3" />
          {deal.value.toLocaleString('pt-BR')}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
          <Clock className="w-3 h-3" />
          {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
