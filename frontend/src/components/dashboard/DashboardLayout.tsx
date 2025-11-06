import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  userRole: string;
  userName: string;
  onLogout: () => void;
  icon?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  userRole,
  userName,
  onLogout,
  icon = "📊"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-indigo-50/50">
      {/* Navigation */}
      <nav className="glass shadow-eco-lg sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🌱⚕️</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                MedDataCollect
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {userRole}
              </span>
              <span className="text-gray-900 font-medium">{userName}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-eco">
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-800 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};