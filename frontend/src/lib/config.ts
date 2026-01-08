/**
 * Configuration centralisée de l'application
 * Toutes les variables d'environnement sont définies ici
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    timeout: 30000, // 30 secondes
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'MedDataCollect',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  },
  storage: {
    tokenKey: 'auth_token',
  },
} as const;

// Helper pour construire les URLs d'API
export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.api.baseUrl}${cleanPath}`;
};

// Validation de la configuration au démarrage
if (typeof window !== 'undefined' && config.features.enableDebug) {
  console.log('[CONFIG]', config);
}
