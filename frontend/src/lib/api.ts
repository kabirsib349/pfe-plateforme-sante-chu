import { apiUrl } from './config';
import type {
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    User,
    Formulaire,
    FormulaireRequest,
    FormulaireMedecin,
    FormulaireRecuResponse,
    FormulaireEnvoyeResponse,
    ReponseFormulaireRequest,
    EnvoiFormulaireRequest,
    UserUpdateRequest,
    ChangePasswordRequest,
    ApiError,
    QuestionPersonnalisee,
} from '@/src/types';

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiException extends Error {
    constructor(
        message: string,
        public status?: number,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiException';
    }
}

/**
 * Helper pour gérer les erreurs de fetch
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            throw new ApiException(
                errorData.message || 'Une erreur est survenue',
                response.status,
                errorData
            );
        } else {
            const errorText = await response.text();
            throw new ApiException(
                errorText || `Erreur HTTP ${response.status}`,
                response.status
            );
        }
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.text() as Promise<T>;
}

/**
 * Helper pour créer les headers avec authentification
 */
function createHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// ============= AUTH API =============

export async function register(data: RegisterRequest): Promise<string> {
    const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
    });

    return handleResponse<string>(response);
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
    });

    return handleResponse<LoginResponse>(response);
}

export async function getUserInfo(token: string): Promise<User> {
    if (!token) {
        throw new ApiException('Token manquant', 401);
    }

    const response = await fetch(apiUrl('/api/users/me'), {
        headers: createHeaders(token),
    });

    return handleResponse<User>(response);
}

// ============= USERS API =============

export async function getMedecins(token: string): Promise<User[]> {
    const response = await fetch(apiUrl('/api/users/medecins'), {
        headers: createHeaders(token),
    });

    return handleResponse<User[]>(response);
}

// ============= FORMULAIRES API =============

export async function getFormulaires(token: string): Promise<Formulaire[]> {
    const response = await fetch(apiUrl('/api/formulaires'), {
        headers: createHeaders(token),
    });

    return handleResponse<Formulaire[]>(response);
}

export async function getFormulaireById(token: string, id: number): Promise<Formulaire> {
    const response = await fetch(apiUrl(`/api/formulaires/${id}`), {
        headers: createHeaders(token),
    });

    return handleResponse<Formulaire>(response);
}

export async function createEnvoiPourChercheur(token: string, formulaireId: number): Promise<FormulaireMedecin> {
    const response = await fetch(apiUrl(`/api/formulaires/${formulaireId}/create-envoi`), {
        method: 'POST',
        headers: createHeaders(token),
    });

    return handleResponse<FormulaireMedecin>(response);
}

export async function createFormulaire(token: string, data: FormulaireRequest): Promise<Formulaire> {
    const response = await fetch(apiUrl('/api/formulaires'), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<Formulaire>(response);
}

export async function updateFormulaire(token: string, id: number, data: FormulaireRequest): Promise<Formulaire> {
    const response = await fetch(apiUrl(`/api/formulaires/${id}`), {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<Formulaire>(response);
}

export async function deleteFormulaire(token: string, id: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/formulaires/${id}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

export async function sendFormulaireToMedecin(
    token: string,
    formulaireId: number,
    emailMedecin: string
): Promise<void> {
    const response = await fetch(apiUrl(`/api/formulaires/${formulaireId}/envoyer`), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ emailMedecin }),
    });

    await handleResponse<void>(response);
}

export async function getFormulairesEnvoyes(token: string): Promise<FormulaireEnvoyeResponse[]> {
    const response = await fetch(apiUrl('/api/formulaires/envoyes'), {
        headers: createHeaders(token),
    });

    return handleResponse<FormulaireEnvoyeResponse[]>(response);
}

export async function getFormulairesRecus(token: string): Promise<FormulaireRecuResponse[]> {
    const response = await fetch(apiUrl('/api/formulaires/recus'), {
        headers: createHeaders(token),
    });

    return handleResponse<FormulaireRecuResponse[]>(response);
}

export async function getFormulaireRecu(token: string, id: number): Promise<Formulaire> {
    const response = await fetch(apiUrl(`/api/formulaires/recus/${id}`), {
        headers: createHeaders(token),
    });

    return handleResponse<Formulaire>(response);
}

export async function deleteFormulaireRecu(token: string, id: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/formulaires/recus/${id}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

export async function deleteFormulaireEnvoye(token: string, id: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/formulaires/envoyes/${id}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

// ============= REPONSES API =============

export async function getReponses(token: string, formulaireMedecinId: number): Promise<any[]> {
    const response = await fetch(apiUrl(`/api/reponses/${formulaireMedecinId}`), {
        headers: createHeaders(token),
    });

    return handleResponse<any[]>(response);
}

export async function getPatientIdentifiers(token: string, formulaireMedecinId: number): Promise<string[]> {
    const response = await fetch(apiUrl(`/api/reponses/${formulaireMedecinId}/patients`), {
        headers: createHeaders(token),
    });

    return handleResponse<string[]>(response);
}

export async function submitReponses(
    token: string,
    data: {
        formulaireMedecinId: number;
        patientIdentifier: string;
        reponses: Record<string, string>;
    },
    enBrouillon: boolean = false
): Promise<void> {
    const url = enBrouillon
        ? apiUrl('/api/reponses?brouillon=true')
        : apiUrl('/api/reponses?brouillon=false');

    const response = await fetch(url, {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    await handleResponse<void>(response);
}

export async function deleteAllReponses(
    token: string,
    formulaireMedecinId: number
): Promise<void> {
    const response = await fetch(apiUrl(`/api/reponses/${formulaireMedecinId}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

/**
 * Supprime les réponses d'un patient spécifique
 */
export async function deletePatientReponses(
    token: string,
    formulaireMedecinId: number,
    patientIdentifier: string
): Promise<void> {
    const response = await fetch(
        apiUrl(`/api/reponses/${formulaireMedecinId}/patient/${encodeURIComponent(patientIdentifier)}`),
        {
            method: 'DELETE',
            headers: createHeaders(token),
        }
    );

    await handleResponse<void>(response);
}

/**
 * Supprime un FormulaireMedecin complet avec toutes ses réponses
 */
export async function deleteFormulaireMedecin(
    token: string,
    formulaireMedecinId: number
): Promise<void> {
    const response = await fetch(
        apiUrl(`/api/formulaires/formulaire-medecin/${formulaireMedecinId}`),
        {
            method: 'DELETE',
            headers: createHeaders(token),
        }
    );

    await handleResponse<void>(response);
}

export async function marquerCommeLu(token: string, formulaireMedecinId: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/reponses/marquer-lu/${formulaireMedecinId}`), {
        method: 'POST',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

export async function getStatistiquesFormulaire(
    token: string,
    formulaireMedecinId: number
): Promise<import('@/src/types').StatistiqueFormulaire> {
    const response = await fetch(
        apiUrl(`/api/reponses/${formulaireMedecinId}/statistiques`),
        {
            headers: createHeaders(token),
        }
    );

    return handleResponse<import('@/src/types').StatistiqueFormulaire>(response);
}

export async function getAllDraftsFormulaire(
    token: string,
    formulaireMedecinId: number
): Promise<import('@/src/types').DraftSummary[]> {
    const response = await fetch(
        apiUrl(`/api/reponses/${formulaireMedecinId}/drafts`),
        {
            headers: createHeaders(token),
        }
    );

    return handleResponse<import('@/src/types').DraftSummary[]>(response);
}

export async function getDraftForPatient(
    token: string,
    formulaireMedecinId: number,
    patientIdentifier: string
): Promise<{ patientIdentifier: string; reponses: any[] } | null> {
    const response = await fetch(
        apiUrl(`/api/reponses/${formulaireMedecinId}/draft/${encodeURIComponent(patientIdentifier)}`),
        {
            headers: createHeaders(token),
        }
    );

    if (response.status === 204) {
        return null; // Pas de brouillon
    }

    return handleResponse<{ patientIdentifier: string; reponses: any[] }>(response);
}

// ============= PROFILE API =============

export async function updateProfile(token: string, data: { nom: string; email: string }): Promise<User> {
    const response = await fetch(apiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<User>(response);
}

export async function changePassword(
    token: string,
    data: { ancienMotDePasse: string; nouveauMotDePasse: string }
): Promise<void> {
    const response = await fetch(apiUrl('/api/users/changer-mot-de-passe'), {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    await handleResponse<void>(response);
}

// ============= STATS API =============

export async function getStats(token: string): Promise<any> {
    const response = await fetch(apiUrl('/api/formulaires/stats'), {
        headers: createHeaders(token),
    });

    return handleResponse<any>(response);
}

// ============= MESSAGES API =============

export async function getChercheurs(token: string): Promise<User[]> {
    const response = await fetch(apiUrl('/api/users/chercheurs'), {
        headers: createHeaders(token),
    });

    return handleResponse<User[]>(response);
}

export async function getConversation(token: string, chercheurId: number, medecinId: number): Promise<any[]> {
    const response = await fetch(apiUrl(`/api/messages/conversation/${chercheurId}/${medecinId}`), {
        headers: createHeaders(token),
    });

    return handleResponse<any[]>(response);
}

export async function sendMessage(token: string, data: { emetteurId: string; destinataireId: string; contenu: string }): Promise<any> {
    const response = await fetch(apiUrl('/api/messages/envoyer'), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
}

export async function marquerMessagesLusChercheur(token: string, chercheurId: number, medecinId: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/messages/conversation/lire/chercheur/${chercheurId}/${medecinId}`), {
        method: 'PUT',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

export async function marquerMessagesLusMedecin(token: string, chercheurId: number, medecinId: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/messages/conversation/lire/medecin/${chercheurId}/${medecinId}`), {
        method: 'PUT',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

// Compte les messages non lus envoyés par emetteurId vers destinataireId
export async function countMessagesNonLus(token: string, destinataireId: number, emetteurId: number): Promise<number> {
    const response = await fetch(apiUrl(`/api/messages/nonlus/${destinataireId}/${emetteurId}`), {
        headers: createHeaders(token),
    });

    return handleResponse<number>(response);
}

export async function countMessagesNonLusChercheur(token: string, chercheurId: number): Promise<number> {
    const response = await fetch(apiUrl(`/api/messages/non-lus/chercheur/${chercheurId}`), {
        headers: createHeaders(token),
    });

    return handleResponse<number>(response);
}

export async function countMessagesNonLusMedecin(token: string, medecinId: number): Promise<number> {
    const response = await fetch(apiUrl(`/api/messages/non-lus/medecin/${medecinId}`), {
        headers: createHeaders(token),
    });

    return handleResponse<number>(response);
}

/**
 * Supprime un message (seul l'émetteur peut supprimer son propre message)
 */
export async function deleteMessage(token: string, messageId: number, userId: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/messages/${messageId}?userId=${userId}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}

// ============= CUSTOM QUESTIONS API =============

export async function getCustomQuestions(token: string): Promise<QuestionPersonnalisee[]> {
    const response = await fetch(apiUrl('/api/questions-perso'), {
        headers: createHeaders(token),
    });

    return handleResponse<QuestionPersonnalisee[]>(response);
}

export async function addCustomQuestion(token: string, question: QuestionPersonnalisee): Promise<QuestionPersonnalisee> {
    const response = await fetch(apiUrl('/api/questions-perso'), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(question),
    });

    return handleResponse<QuestionPersonnalisee>(response);
}

export async function deleteCustomQuestion(token: string, id: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/questions-perso/${id}`), {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
}
