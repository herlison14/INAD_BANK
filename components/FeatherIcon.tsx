
import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface FeatherIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

const FeatherIcon: React.FC<FeatherIconProps> = ({ name, ...props }) => {
  // Map some names if they differ from Lucide
  const nameMap: Record<string, string> = {
    'pie-chart': 'PieChart',
    'bar-chart-2': 'BarChart2',
    'check-square': 'CheckSquare',
    'trash-2': 'Trash2',
    'alert-circle': 'AlertCircle',
    'message-square': 'MessageSquare',
    'trending-up': 'TrendingUp',
    'alert-octagon': 'AlertOctagon',
    'check-circle': 'CheckCircle',
    'file-text': 'FileText',
    'user-plus': 'UserPlus',
  };

  const lucideName = nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (Icons as any)[lucideName] || Icons.HelpCircle;

  return <IconComponent {...props} />;
};

export default FeatherIcon;
