"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { Card } from '@/src/components/Card';
import { ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Message {
    text: string;
    type: 'success' | 'error';
}

export default function ParametresPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, token } = useAuth();

    // State for profile form
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<Message | null>(null);

    // State for password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
        if (user) {
            setNom(user.nom);
            setEmail(user.email);
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setIsProfileSaving(true);
        setProfileMessage(null);

        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nom, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Une erreur est survenue.');
            }

            setProfileMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
            // Optionnel: Mettre à jour le contexte utilisateur global si nécessaire

        } catch (error: any) {
            setProfileMessage({ text: error.message, type: 'error' });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setIsPasswordSaving(true);
        setPasswordMessage(null);

        if (newPassword !== confirmationPassword) {
            setPasswordMessage({ text: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.', type: 'error' });
            setIsPasswordSaving(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/users/changer-mot-de-passe', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword, confirmationPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Une erreur est survenue.');
            }
            
            setPasswordMessage({ text: 'Mot de passe mis à jour avec succès !', type: 'success' });
            // Vider les champs après succès
            setCurrentPassword('');
            setNewPassword('');
            setConfirmationPassword('');

        } catch (error: any) {
            setPasswordMessage({ text: error.message, type: 'error' });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    if (isLoading || !isAuthenticated) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour
                    </button>
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-eco">
                            <UserCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Paramètres du compte</h1>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* --- Formulaire de profil --- */}
                    <Card title="Informations du profil">
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
                                <input
                                    type="text"
                                    id="nom"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    disabled={isProfileSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-blue-300"
                                >
                                    {isProfileSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                                {profileMessage && (
                                    <div className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {profileMessage.text}
                                    </div>
                                )}
                            </div>
                        </form>
                    </Card>

                    {/* --- Formulaire de mot de passe --- */}
                    <Card title="Changer le mot de passe">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmationPassword" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                                <input
                                    type="password"
                                    id="confirmationPassword"
                                    value={confirmationPassword}
                                    onChange={(e) => setConfirmationPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    disabled={isPasswordSaving}
                                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-400"
                                >
                                    {isPasswordSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
                                </button>
                                {passwordMessage && (
                                    <div className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}