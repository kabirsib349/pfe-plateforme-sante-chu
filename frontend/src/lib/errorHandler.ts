import { ApiException } from './api';
import { config } from './config';

/**
 * Types d'erreurs
 */
export enum ErrorType {
    NETWORK = 'NETWORK',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    VALIDATION = 'VALIDATION',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN',
}

/**
 * Interface pour les erreurs formatées
 */
export interface FormattedError {
    type: ErrorType;
    message: string;
    userMessage: string;
    status?: number;
    originalError?: unknown;
}

/**
 * Détermine le type d'erreur en fonction du status HTTP
 */
function getErrorType(status?: number): ErrorType {
    if (!status) return ErrorType.NETWORK;

    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status >= 400 && status < 500) return ErrorType.VALIDATION;
    if (status >= 500) return ErrorType.SERVER;

    return ErrorType.UNKNOWN;
}

/**
 * Messages utilisateur par défaut selon le type d'erreur
 */
const defaultUserMessages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
    [ErrorType.AUTHENTICATION]: 'Votre session a expiré. Veuillez vous reconnecter.',
    [ErrorType.AUTHORIZATION]: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
    [ErrorType.VALIDATION]: 'Les données fournies sont invalides.',
    [ErrorType.NOT_FOUND]: 'La ressource demandée n\'existe pas.',
    [ErrorType.SERVER]: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
    [ErrorType.UNKNOWN]: 'Une erreur inattendue est survenue.',
};

/**
 * Formate une erreur pour l'affichage utilisateur
 */
export function formatError(error: unknown): FormattedError {
    // Erreur API personnalisée
    if (error instanceof ApiException) {
        const type = getErrorType(error.status);

        return {
            type,
            message: error.message,
            userMessage: error.message || defaultUserMessages[type],
            status: error.status,
            originalError: error,
        };
    }

    // Erreur réseau (fetch failed)
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
            type: ErrorType.NETWORK,
            message: error.message,
            userMessage: defaultUserMessages[ErrorType.NETWORK],
            originalError: error,
        };
    }

    // Erreur standard
    if (error instanceof Error) {
        return {
            type: ErrorType.UNKNOWN,
            message: error.message,
            userMessage: error.message || defaultUserMessages[ErrorType.UNKNOWN],
            originalError: error,
        };
    }

    // Erreur inconnue
    return {
        type: ErrorType.UNKNOWN,
        message: String(error),
        userMessage: defaultUserMessages[ErrorType.UNKNOWN],
        originalError: error,
    };
}

/**
 * Log une erreur (console en dev, service externe en prod)
 */
export function logError(error: FormattedError, context?: string): void {
    const logData = {
        timestamp: new Date().toISOString(),
        context,
        ...error,
    };

    if (config.features.enableDebug) {
        console.error('[ERROR]', logData);
    }

    // TODO: Envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    // if (config.features.enableAnalytics) {
    //     sendToMonitoring(logData);
    // }
}

/**
 * Gère une erreur de manière centralisée
 */
export function handleError(
    error: unknown,
    context?: string,
    onError?: (formattedError: FormattedError) => void
): FormattedError {
    const formattedError = formatError(error);

    logError(formattedError, context);

    if (onError) {
        onError(formattedError);
    }

    return formattedError;
}

/**
 * Hook-like function pour gérer les erreurs dans les composants
 */
export function useErrorHandler() {
    return {
        handleError: (error: unknown, context?: string) => handleError(error, context),
        formatError,
        logError,
    };
}
