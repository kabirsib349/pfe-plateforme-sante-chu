/**
 * Utilities for date formatting.
 * Centralizes date formatting logic used throughout the application.
 */

/**
 * Default date format options for French locale.
 */
const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
};

/**
 * Date and time format options for French locale.
 */
const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
};

/**
 * Short date format options for French locale.
 */
const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
};

/**
 * Formats a date to French locale.
 * @param date - Date string or Date object
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateFR = (
    date: string | Date,
    options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'Date invalide';
        }

        return dateObj.toLocaleDateString('fr-FR', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date invalide';
    }
};

/**
 * Formats a date with time to French locale.
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTimeFR = (date: string | Date): string => {
    return formatDateFR(date, DATETIME_OPTIONS);
};

/**
 * Formats a date to short French format (DD/MM/YYYY).
 * @param date - Date string or Date object
 * @returns Formatted short date string
 */
export const formatShortDateFR = (date: string | Date): string => {
    return formatDateFR(date, SHORT_DATE_OPTIONS);
};

/**
 * Returns human-readable relative time (e.g., "il y a 2 heures").
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'Date invalide';
        }

        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return "À l'instant";
        } else if (diffMinutes < 60) {
            return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else {
            return formatDateFR(dateObj);
        }
    } catch (error) {
        console.error('Error calculating relative time:', error);
        return 'Date invalide';
    }
};
