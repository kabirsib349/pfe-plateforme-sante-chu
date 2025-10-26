import React, { FC, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  icon?: string;
}

export const Card: FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  hover = false,
  glass = false,
  icon
}) => {
  const baseClasses = 'rounded-lg shadow transition-all duration-300';
  const hoverClasses = hover ? 'hover:-translate-y-2 hover:shadow-lg' : '';
  const backgroundClasses = glass ? 'glass border border-white/20' : 'bg-white';
  
  const classes = `${baseClasses} ${backgroundClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes}>
      {(title || subtitle || action) && (
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-eco">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-xl font-semibold text-gray-800">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};