"use client";

import React from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher le header sur les pages de login/register
  if (!user || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getDashboardPath = () => {
    return user.role === 'medecin' ? '/dashboard-medecin' : '/dashboard-chercheur';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-800">Plateforme Santé</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(getDashboardPath())}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              title="Retour au tableau de bord"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              title="Se déconnecter"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
