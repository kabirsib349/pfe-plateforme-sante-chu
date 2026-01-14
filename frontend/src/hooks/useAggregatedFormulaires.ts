import { useState, useEffect, useCallback } from 'react';
import { getFormulairesEnvoyes, getPatientIdentifiers, getReponses } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import type { Formulaire } from '@/src/types';

/**
 * Aggregated form data structure.
 */
export interface AggregatedFormulaire {
    /** The form itself */
    formulaire: Formulaire;
    /** Number of unique patients */
    patientsCount: number;
    /** Total number of responses */
    totalResponses: number;
    /** Timestamp of the most recent activity */
    latestTimestamp: number;
    /** Set of unique patient identifiers */
    patientIds: Set<string>;
}

/**
 * Options for the useAggregatedFormulaires hook.
 */
export interface UseAggregatedFormulairesOptions {
    /** Authentication token */
    token: string | null;
    /** Whether to auto-fetch on mount */
    autoFetch?: boolean;
}

/**
 * Return type for the useAggregatedFormulaires hook.
 */
export interface UseAggregatedFormulairesReturn {
    /** Aggregated formulaires */
    aggregated: AggregatedFormulaire[];
    /** Raw formulaires envoyés data */
    formulairesEnvoyes: any[];
    /** Loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh the data */
    refresh: () => Promise<void>;
    /** Count of completed formulaires */
    completedCount: number;
}

/**
 * Extracts patient identifier from a response object.
 * Tries multiple possible property names.
 */
const extractPatientId = (r: any): string | null => {
    if (!r) return null;
    const candidates = [
        r.patientIdentifier,
        r.patientId,
        r.patient?.id,
        r.patient?.identifier,
        r.patient?.identifierValue,
        r.patient_identifier,
        r.patient_identifier_value,
        r.identifier,
        r.patientIdentifierValue,
    ];
    for (const c of candidates) {
        if (c !== undefined && c !== null && String(c).trim() !== '') {
            return String(c);
        }
    }
    // Try if response has a champ named IDENTIFIANT or similar
    if (r.champ?.nomVariable) {
        const v = r.valeur;
        if (v !== undefined && v !== null && String(v).trim() !== '') {
            return String(v);
        }
    }
    return null;
};

/**
 * Hook for fetching and aggregating formulaires envoyés by form ID.
 * Extracts complex aggregation logic from DataTab.tsx.
 * 
 * @example
 * ```tsx
 * const { aggregated, isLoading, refresh } = useAggregatedFormulaires({ token });
 * ```
 */
export function useAggregatedFormulaires({
    token,
    autoFetch = true
}: UseAggregatedFormulairesOptions): UseAggregatedFormulairesReturn {
    const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<any[]>([]);
    const [aggregated, setAggregated] = useState<AggregatedFormulaire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAndAggregate = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getFormulairesEnvoyes(token);
            setFormulairesEnvoyes(data);

            // Aggregate by formulaire.idFormulaire
            const map = new Map<number, {
                formulaire: any;
                patientIds: Set<string>;
                totalResponses: number;
                latestTimestamp: number;
            }>();

            // First pass: initialize map entries
            for (const fe of data) {
                const fid = fe.formulaire.idFormulaire;
                const ts = fe.dateCompletion
                    ? new Date(fe.dateCompletion).getTime()
                    : (fe.dateEnvoi ? new Date(fe.dateEnvoi).getTime() : 0);

                if (!map.has(fid)) {
                    map.set(fid, {
                        formulaire: fe.formulaire,
                        patientIds: new Set(),
                        totalResponses: 0,
                        latestTimestamp: ts
                    });
                } else {
                    const curr = map.get(fid)!;
                    if (ts > (curr.latestTimestamp || 0)) {
                        curr.latestTimestamp = ts;
                    }
                }
            }

            // Second pass: fetch patient identifiers for each FormulaireMedecin
            await Promise.all(data.map(async (fe: any) => {
                try {
                    const entry = map.get(fe.formulaire.idFormulaire);
                    if (!entry) return;

                    let ids: string[] = [];

                    // Try to get patient identifiers directly
                    try {
                        ids = await getPatientIdentifiers(token, fe.id);
                    } catch (e) {
                        // Endpoint may not exist or fail - we'll fallback
                    }

                    if (!ids || ids.length === 0) {
                        // Fallback: fetch responses and extract patientIdentifier
                        try {
                            const reps = await getReponses(token, fe.id);
                            const extractedSet = new Set<string>();

                            reps.forEach((r: any) => {
                                const pid = extractPatientId(r);
                                if (pid) extractedSet.add(pid);
                            });

                            if (extractedSet.size > 0) {
                                extractedSet.forEach(id => entry.patientIds.add(id));
                            } else {
                                // No patient identifiers found: count FormulaireMedecin as one patient
                                entry.patientIds.add(`fm-${fe.id}`);
                            }

                            entry.totalResponses += reps.length;
                        } catch (err) {
                            // If even this fails, count the envoi as one patient
                            entry.patientIds.add(`fm-${fe.id}`);
                        }
                    } else {
                        ids.forEach((id) => entry.patientIds.add(id));
                        entry.totalResponses += ids.length;
                    }

                    const ts = fe.dateCompletion
                        ? new Date(fe.dateCompletion).getTime()
                        : (fe.dateEnvoi ? new Date(fe.dateEnvoi).getTime() : 0);
                    if (ts > (entry.latestTimestamp || 0)) {
                        entry.latestTimestamp = ts;
                    }
                } catch (e) {
                    // Ignore individual failures
                }
            }));

            // Convert map to array and sort by latest timestamp
            const agg: AggregatedFormulaire[] = Array.from(map.values()).map(v => ({
                formulaire: v.formulaire,
                patientsCount: v.patientIds.size,
                totalResponses: v.totalResponses,
                latestTimestamp: v.latestTimestamp || 0,
                patientIds: v.patientIds
            }));

            agg.sort((a, b) => (b.latestTimestamp || 0) - (a.latestTimestamp || 0));
            setAggregated(agg);

        } catch (err) {
            const formattedError = handleError(err, 'FetchFormulairesEnvoyes');
            setError(formattedError.userMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchAndAggregate();
        }
    }, [autoFetch, fetchAndAggregate]);

    // Count completed formulaires
    const completedCount = formulairesEnvoyes.filter(f => f.complete).length;

    return {
        aggregated,
        formulairesEnvoyes,
        isLoading,
        error,
        refresh: fetchAndAggregate,
        completedCount
    };
}
