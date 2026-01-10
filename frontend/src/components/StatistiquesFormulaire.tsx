"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { getStatistiquesFormulaire } from '@/src/lib/api';
import { StatistiqueFormulaire } from '@/src/types';
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
    formulaireMedecinId: number;
}

export function StatistiquesFormulaire({ formulaireMedecinId }: Props) {
    const { token } = useAuth();
    const [stats, setStats] = useState<StatistiqueFormulaire | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            try {
                const data = await getStatistiquesFormulaire(token, formulaireMedecinId);
                setStats(data);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [formulaireMedecinId, token]);

    if (isLoading) {
        return (
            <div className="animate-pulse flex gap-4">
                <div className="h-24 bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-24 bg-gray-200 rounded-lg flex-1"></div>
            </div>
        );
    }

    if (!stats) return null;

    const total = stats.nombreReponsesCompletes + stats.nombreReponsesEnCours;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total réponses</p>
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                    </div>
                </div>
            </div>

            {/* Complétées */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Complétées</p>
                        <p className="text-2xl font-bold text-green-600">{stats.nombreReponsesCompletes}</p>
                    </div>
                </div>
            </div>

            {/* En cours */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">En cours</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.nombreReponsesEnCours}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
