
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-[#2e3347] rounded-md ${className}`} />
  );
};
