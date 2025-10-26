import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: string;
}

export default function Badge({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  icon
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full transition-all duration-200';
  
  const variantClasses = {
    success: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200',
    error: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
    info: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200',
    neutral: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </span>
  );
}