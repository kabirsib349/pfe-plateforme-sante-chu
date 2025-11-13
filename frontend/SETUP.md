# 🚀 Configuration du Frontend

## Variables d'environnement

1. Copiez le fichier `.env.example` vers `.env.local`:
```bash
cp .env.example .env.local
```

2. Modifiez les valeurs selon votre environnement

## Structure des types

Tous les types TypeScript sont centralisés dans `src/types/index.ts`

## Configuration

La configuration est centralisée dans `src/lib/config.ts`

## Gestion des erreurs

Utilisez `handleError` de `src/lib/errorHandler.ts` pour une gestion cohérente

## Hooks personnalisés

- `useApi`: Pour les appels API avec gestion automatique du loading/error
- `useMutation`: Pour les mutations (POST, PUT, DELETE)
