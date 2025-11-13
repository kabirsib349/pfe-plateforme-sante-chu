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