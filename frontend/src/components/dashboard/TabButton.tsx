import React, { FC, ReactNode } from 'react';

interface TabButtonProps {
  id: string;
  activeTab: string;
  setActiveTab: (id: string) => void;
  children: ReactNode;
}

export const TabButton: FC<TabButtonProps> = ({ 
  id, 
  activeTab, 
  setActiveTab, 
  children 
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`py-2 px-3 whitespace-nowrap font-medium border-b-2 transition-colors ${
      activeTab === id
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
    }`}
  >
    {children}
  </button>
);