import React, { FC } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  icon?: string;
}

export const StatCard: FC<StatCardProps> = ({ 
  label, 
  value, 
  valueColor = "text-emerald-600",
  icon 
}) => (
  <div className="glass rounded-2xl shadow-eco p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-eco-lg border border-white/20">
    {icon && (
      <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
        <span className="text-xl">{icon}</span>
      </div>
    )}
    <div className="text-gray-600 text-sm font-medium">{label}</div>
    <div className={`text-4xl font-bold mt-3 ${valueColor}`}>{value}</div>
  </div>
);