"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword } from '@/src/lib/validation';
import { register } from '@/src/lib/api';
import { useToast } from '@/src/hooks/useToast';
import { ToastContainer } from '@/src/components';
import { handleError } from '@/src/lib/errorHandler';
import { BeakerIcon, AcademicCapIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('chercheur');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Valider le mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await register({ nom, email, password, role });
      showToast("Inscription réussie ! Redirection vers la connexion...", "success");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      const formattedError = handleError(err, 'Register');
      setError(formattedError.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-10 right-10 w-28 h-28 bg-emerald-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-32 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-pulse-soft"></div>

        <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
          <div className="glass rounded-3xl p-8 w-full max-w-md shadow-eco-lg border border-white/20 animate-fade-in-up">
            <div className="text-center mb-8">
              {/* Logo eco-friendly */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-eco">
                <BeakerIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">Rejoignez la communauté MedDataCollect</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="nom">Nom complet</label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Entrez votre nom complet"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="email">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre.email@chu.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 12 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Sélectionnez votre rôle</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${role === 'chercheur'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                    }`}>
                    <input
                      type="radio"
                      name="role"
                      value="chercheur"
                      checked={role === 'chercheur'}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    {role === 'chercheur' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <BeakerIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="font-semibold text-sm">Chercheur</div>
                      <div className="text-xs mt-1 opacity-75">Recherche médicale</div>
                    </div>
                  </label>

                  <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${role === 'medecin'
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-800 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-sm'
                    }`}>
                    <input
                      type="radio"
                      name="role"
                      value="medecin"
                      checked={role === 'medecin'}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    {role === 'medecin' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <AcademicCapIcon className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div className="font-semibold text-sm">Médecin</div>
                      <div className="text-xs mt-1 opacity-75">Investigateur coordinateur</div>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                aria-label="Créer un compte"
                className="btn-eco w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-eco-lg hover:shadow-xl focus-eco"
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlusIcon className="w-5 h-5" />
                  Créer le compte
                </span>
              </button>

              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Se connecter
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}