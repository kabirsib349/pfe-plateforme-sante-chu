import { apiUrl } from './config';
import type {
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    User,
    ApiError,
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

export async function getFormulaires(token: string): Promise<any[]> {
    const response = await fetch(apiUrl('/api/formulaires'), {
        headers: createHeaders(token),
    });

    return handleResponse<any[]>(response);
}

export async function getFormulaireById(token: string, id: number): Promise<any> {
    const response = await fetch(apiUrl(`/api/formulaires/${id}`), {
        headers: createHeaders(token),
    });

    return handleResponse<any>(response);
}

export async function createFormulaire(token: string, data: any): Promise<any> {
    const response = await fetch(apiUrl('/api/formulaires'), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
}

export async function updateFormulaire(token: string, id: number, data: any): Promise<any> {
    const response = await fetch(apiUrl(`/api/formulaires/${id}`), {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
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

export async function getFormulairesEnvoyes(token: string): Promise<any[]> {
    const response = await fetch(apiUrl('/api/formulaires/envoyes'), {
        headers: createHeaders(token),
    });

    return handleResponse<any[]>(response);
}

export async function getFormulairesRecus(token: string): Promise<any[]> {
    const response = await fetch(apiUrl('/api/formulaires/recus'), {
        headers: createHeaders(token),
    });

    return handleResponse<any[]>(response);
}

export async function getFormulaireRecu(token: string, id: number): Promise<any> {
    const response = await fetch(apiUrl(`/api/formulaires/recus/${id}`), {
        headers: createHeaders(token),
    });

    return handleResponse<any>(response);
}

export async function deleteFormulaireRecu(token: string, id: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/formulaires/recus/${id}`), {
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

export async function submitReponses(token: string, data: any): Promise<void> {
    const response = await fetch(apiUrl('/api/reponses'), {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(data),
    });

    await handleResponse<void>(response);
}

export async function marquerCommeLu(token: string, formulaireMedecinId: number): Promise<void> {
    const response = await fetch(apiUrl(`/api/reponses/marquer-lu/${formulaireMedecinId}`), {
        method: 'POST',
        headers: createHeaders(token),
    });

    await handleResponse<void>(response);
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