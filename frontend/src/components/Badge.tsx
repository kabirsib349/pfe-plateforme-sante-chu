import React, { FC, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ 
  children, 
  color = 'blue', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-semibold rounded-full';
  
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const classes = `${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${className}`;

  return <span className={classes}>{children}</span>;
};