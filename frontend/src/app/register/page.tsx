"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword } from '@/src/lib/validation';
import { register } from '@/src/lib/api';
import { useToast } from '@/src/hooks/useToast';
import ToastContainer from '@/src/components/ToastContainer';

export default function Register() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('chercheur');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    //valider le mot de passe
    const passwordError = validatePassword(password)
    if(passwordError){
      setError(passwordError);
      return;
    }

    try {
        await register({nom, email, password, role});
        showToast("Inscription réussie ! Redirection vers la connexion...", "success");
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        } catch(err: any){
          console.error(err);
          setError(err.message || "L'inscription a échoué. Veuillez réessayer.");
        }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">Rejoignez MedDataCollect</p>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Sélectionnez votre rôle</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                role === 'chercheur' 
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
                  <div className="text-3xl mb-2">🔬</div>
                  <div className="font-semibold text-sm">Chercheur</div>
                  <div className="text-xs mt-1 opacity-75">Recherche médicale</div>
                </div>
              </label>
              
              <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                role === 'medecin' 
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
                  <div className="text-3xl mb-2">👨‍⚕️</div>
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Créer le compte
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
    </main>
    </>
  );
}
