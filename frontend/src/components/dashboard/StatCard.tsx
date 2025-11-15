import React, { FC, ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  error?: boolean;
}

export const StatCard: FC<StatCardProps> = ({ 
  label, 
  value, 
  valueColor = "text-emerald-600",
  icon,
  isLoading = false,
  error = false
}) => (
  <div className="glass rounded-2xl shadow-eco p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-eco-lg border border-white/20">
    {icon && (
      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
    )}
    <div className="text-gray-800 text-sm font-medium">{label}</div>
    <div className={`text-4xl font-bold mt-3 ${valueColor}`}>
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-10 w-16 mx-auto rounded"></div>
      ) : error ? (
        <span className="text-red-500 text-lg">--</span>
      ) : (
        value
      )}
    </div>
  </div>
);