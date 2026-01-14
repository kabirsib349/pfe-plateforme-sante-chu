"use client";

import React, { useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeftOnRectangleIcon,
  BeakerIcon,
  HeartIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ne pas afficher le header sur les pages publiques (login/register/accueil)
  const publicPaths = ['/', '/login', '/register'];
  if (!user || publicPaths.includes(pathname)) {
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
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(getDashboardPath())}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg relative">
              <BeakerIcon className="w-5 h-5 text-white absolute top-1 left-1" />
              <HeartIcon className="w-5 h-5 text-white absolute bottom-1 right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                MedDataCollect
              </h1>
              <p className="text-xs text-gray-500">Plateforme de collecte de données médicales</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation pour chercheurs */}
            {user.role === 'chercheur' && (
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/dashboard-chercheur')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-all flex items-center gap-2 ${pathname === '/dashboard-chercheur'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                  <span>Tableau de bord</span>
                </button>
                <button
                  onClick={() => router.push('/formulaire')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-all flex items-center gap-2 ${pathname.startsWith('/formulaire')
                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>Mes Formulaires</span>
                </button>
              </nav>
            )}

            {/* Navigation pour médecins */}
            {user.role === 'medecin' && (
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/dashboard-medecin')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border shadow-sm transition-all flex items-center gap-2 ${pathname === '/dashboard-medecin'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                  <span>Tableau de bord</span>
                </button>
              </nav>
            )}

            {/* Menu utilisateur avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{user.nom}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {user.role === 'chercheur' ? (
                        <>
                          <BeakerIcon className="w-3 h-3" />
                          <span>Chercheur</span>
                        </>
                      ) : (
                        <>
                          <AcademicCapIcon className="w-3 h-3" />
                          <span>Médecin</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <>
                  {/* Overlay pour fermer le menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    {/* Info utilisateur */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                          {user.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.nom}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2 px-2 space-y-1">
                      <button
                        onClick={() => {
                          router.push('/parametres');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                      >
                        <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span>Paramètres du compte</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push(getDashboardPath());
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span>Mon profil</span>
                      </button>
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header >
  );
};

export default DashboardHeader;
