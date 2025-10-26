import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  icon?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  hover = false,
  glass = false,
  icon
}: CardProps) {
  const baseClasses = 'rounded-2xl shadow-eco border border-white/20 transition-all duration-300';
  const hoverClasses = hover ? 'hover:-translate-y-2 hover:shadow-eco-lg' : '';
  const backgroundClasses = glass ? 'glass' : 'bg-white';
  
  const classes = `${baseClasses} ${backgroundClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes}>
      {(title || subtitle) && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-eco">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}