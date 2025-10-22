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
        await register({nom, email, password});
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
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-blue-700 mb-6">
          Créer un compte Chercheur
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Nom</label>
            <input
                id="nom"
                type="text"
                placeholder="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@chu.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            aria-label="Créer un compte"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Créer le compte
          </button>

          <div className="text-center mt-4">
            <p className="text-sm">
              Vous avez déjà un compte ?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
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
