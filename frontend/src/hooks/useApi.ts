import { useState, useCallback } from 'react';
import { handleError, FormattedError } from '@/src/lib/errorHandler';

/**
 * État d'un appel API
 */
interface ApiState<T> {
    data: T | null;
    isLoading: boolean;
    error: FormattedError | null;
}

/**
 * Options pour useApi
 */
interface UseApiOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: FormattedError) => void;
    context?: string;
}

/**
 * Hook personnalisé pour gérer les appels API avec loading et error states
 */
export function useApi<T = any>(options?: UseApiOptions) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        isLoading: false,
        error: null,
    });

    /**
     * Exécute un appel API
     */
    const execute = useCallback(
        async (apiCall: () => Promise<T>): Promise<T | null> => {
            setState({ data: null, isLoading: true, error: null });

            try {
                const result = await apiCall();
                
                setState({ data: result, isLoading: false, error: null });
                
                if (options?.onSuccess) {
                    options.onSuccess(result);
                }
                
                return result;
            } catch (error) {
                const formattedError = handleError(
                    error,
                    options?.context,
                    options?.onError
                );
                
                setState({ data: null, isLoading: false, error: formattedError });
                
                return null;
            }
        },
        [options]
    );

    /**
     * Réinitialise l'état
     */
    const reset = useCallback(() => {
        setState({ data: null, isLoading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 */
export function useMutation<TData = any, TVariables = any>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseApiOptions
) {
    const { execute, ...state } = useApi<TData>(options);

    const mutate = useCallback(
        async (variables: TVariables): Promise<TData | null> => {
            return execute(() => mutationFn(variables));
        },
        [execute, mutationFn]
    );

    return {
        ...state,
        mutate,
    };
}
