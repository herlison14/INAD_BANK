
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';

interface SubTab {
  id: string;
  label: string;
  icon: string;
  component: React.ReactNode;
}

interface UnifiedViewProps {
  tabs: SubTab[];
  initialTabId?: string;
}

const UnifiedView: React.FC<UnifiedViewProps> = ({ tabs, initialTabId }) => {
  const [activeTabId, setActiveTabId] = useState(initialTabId || tabs[0]?.id);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return (
    <div className="flex flex-col h-full">
      {/* Google-style Sub-tabs */}
      <div className="flex items-center border-b border-[#2e3347] bg-[#1a1f2e]/50 backdrop-blur-md px-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-wider transition-all relative whitespace-nowrap ${
              activeTabId === tab.id
                ? 'text-emerald-400'
                : 'text-[#a0aec0] hover:text-[#f0f4ff]'
            }`}
          >
            <FeatherIcon name={tab.icon} className={`w-3.5 h-3.5 ${activeTabId === tab.id ? 'text-emerald-400' : 'text-[#a0aec0]'}`} />
            <span className="font-black">{tab.label}</span>
            {activeTabId === tab.id && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab?.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedView;
