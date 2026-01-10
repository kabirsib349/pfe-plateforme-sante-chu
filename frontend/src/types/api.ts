import { User } from './user';

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    loading?: boolean;
}

export interface ApiError {
    message: string;
    status?: number;
    timestamp?: string;
    errors?: Record<string, string>; // Pour les erreurs de validation
}

export interface Message {
    id: number;
    contenu: string;
    dateEnvoi: string;
    lu: boolean;
    emetteur: User;
    destinataire: User;
}
