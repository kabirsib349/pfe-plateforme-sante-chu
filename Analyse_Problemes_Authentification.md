# Analyse des Problèmes d'Authentification - Médecin/Chercheur

## 🚨 Problèmes Identifiés

### 1. **PROBLÈME MAJEUR : Dashboard Médecin n'est pas un composant React**

Le fichier `frontend/src/app/dashboard-medecin/page.tsx` contient du **HTML statique** au lieu d'un composant React Next.js.

**Problème :**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <!-- ... HTML statique ... -->
```

**Solution attendue :**
```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function DashboardMedecin() {
    // Code React ici
}
```

### 2. **Incohérence dans la Gestion des Rôles**

#### Backend - Service d'Authentification
```java
// Dans AuthentificationService.java - CORRECT
Role userRole = roleRepository.findByNom(request.getRole() != null? request.getRole() : "chercheur")
    .orElseThrow(() -> new IllegalStateException("Le rôle spécifié n'a pas été trouvé."));
```

#### Frontend - RegisterRequest DTO
```java
// Dans RegisterRequest.java - CORRECT
private String role; // Le champ role existe
```

#### Frontend - API Call
```typescript
// Dans api.ts - CORRECT
export async function register(data: { nom: string; email: string; password: string; role: string })
```

#### Frontend - Register Page
```typescript
// Dans register/page.tsx - CORRECT
const [role, setRole] = useState('chercheur');
await register({nom, email, password, role});
```

**✅ La gestion des rôles semble correcte côté inscription.**

### 3. **Problème de Redirection après Connexion**

#### Code de Login
```typescript
// Dans login/page.tsx
const response: LoginResponse = await apiLogin({ email, password });
login(response.token);
const userInfo = await getUserInfo(response.token);
if(userInfo.role === 'medecin'){
    router.push("/dashboard-medecin")  // ❌ Page HTML statique
}else{
    router.push("/dashboard-chercheur"); // ✅ Composant React correct
}
```

**Problème :** La redirection vers `/dashboard-medecin` mène à une page HTML statique qui ne peut pas utiliser les hooks React d'authentification.

### 4. **Problème de Validation de Mot de Passe sur Login**

```typescript
// Dans login/page.tsx
const passwordError = validatePassword(password);
if (passwordError) {
    setError(passwordError);
    return;
}
```

**Problème :** La validation côté client empêche la connexion avec des mots de passe existants qui ne respectent pas les nouvelles règles de validation (12 caractères minimum, etc.).

### 5. **Champ 2FA Non Utilisé**

```typescript
// Dans login/page.tsx
const [code2FA, setCode2FA] = useState("");
// ... mais le code2FA n'est jamais envoyé au backend
```

**Problème :** L'interface affiche un champ 2FA mais il n'est pas implémenté côté backend.

---

## 🔧 Solutions Recommandées

### 1. **URGENT : Convertir dashboard-medecin en Composant React**

Remplacer le contenu de `frontend/src/app/dashboard-medecin/page.tsx` :

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
        // Vérifier que l'utilisateur est bien un médecin
        if (!isLoading && isAuthenticated && user?.role !== 'medecin') {
            router.push("/dashboard-chercheur");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return <div>Chargement...</div>;
    if (!isAuthenticated) return null;
    if (user?.role !== 'medecin') return null;

    return (
        <main className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-xl font-bold text-blue-600">
                            MedDataCollect
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                Investigateur Coordinateur
                            </span>
                            <span className="text-gray-700">{user?.nom}</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Tableau de Bord - Investigateur Coordinateur
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">5</div>
                        <div className="text-gray-600">Études actives</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-gray-600">Formulaires créés</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">248</div>
                        <div className="text-gray-600">Patients inclus</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">18</div>
                        <div className="text-gray-600">Investigateurs actifs</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">3,842</div>
                        <div className="text-gray-600">Données collectées</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-2xl font-bold text-red-600">7</div>
                        <div className="text-gray-600">Feedback en attente</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
                    <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <div className="font-medium">Nouvelle saisie</div>
                            <div className="text-sm text-gray-600">
                                Dr. Martin - Patient P-2025-0012 - Formulaire J+15
                            </div>
                            <div className="text-xs text-gray-500">18/10/2025 14:30</div>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                            <div className="font-medium">Formulaire validé</div>
                            <div className="text-sm text-gray-600">
                                Étude Neurologique Phase II
                            </div>
                            <div className="text-xs text-gray-500">18/10/2025 11:15</div>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                            <div className="font-medium">Feedback reçu</div>
                            <div className="text-sm text-gray-600">
                                Dr. Lefebvre - Suggestions pour Suivi Post-opératoire
                            </div>
                            <div className="text-xs text-gray-500">17/10/2025 16:45</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
```

### 2. **Supprimer la Validation de Mot de Passe sur Login**

```typescript
// Dans login/page.tsx - SUPPRIMER ces lignes :
const passwordError = validatePassword(password);
if (passwordError) {
    setError(passwordError);
    return;
}
```

**Raison :** La validation doit se faire uniquement à l'inscription, pas à la connexion.

### 3. **Ajouter la Vérification de Rôle dans les Dashboards**

#### Dashboard Chercheur
```typescript
// Dans dashboard-chercheur/page.tsx - AJOUTER :
useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.push("/login");
    }
    // Vérifier que l'utilisateur est bien un chercheur
    if (!isLoading && isAuthenticated && user?.role !== 'chercheur') {
        router.push("/dashboard-medecin");
    }
}, [isAuthenticated, isLoading, user, router]);

if (user?.role !== 'chercheur') return null;
```

### 4. **Gérer le Champ 2FA**

Soit l'implémenter complètement, soit le supprimer :

```typescript
// Option 1: Supprimer le champ 2FA
// Supprimer ces lignes dans login/page.tsx :
<div>
    <label className="block text-sm font-medium mb-1">
        Code d'authentification à deux facteurs
    </label>
    <input
        type="text"
        placeholder="Code à 6 chiffres"
        maxLength={6}
        onChange={(e) => setCode2FA(e.target.value)}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
</div>
```

### 5. **Améliorer la Gestion d'Erreurs**

```typescript
// Dans login/page.tsx - AMÉLIORER :
} catch (err: any) {
    console.error(err);
    if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError("Email ou mot de passe incorrect.");
    } else if (err.message.includes('Network')) {
        setError("Erreur de connexion au serveur.");
    } else {
        setError(err.message || "Une erreur est survenue lors de la connexion.");
    }
}
```

---

## 🧪 Tests Recommandés

### 1. **Test d'Inscription**
```bash
# Tester l'inscription avec rôle médecin
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dr. Test",
    "email": "test.medecin@chu.fr",
    "password": "TestPassword123!",
    "role": "medecin"
  }'
```

### 2. **Test de Connexion**
```bash
# Tester la connexion
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.medecin@chu.fr",
    "password": "TestPassword123!"
  }'
```

### 3. **Test de Récupération d'Infos Utilisateur**
```bash
# Tester avec le token reçu
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 Checklist de Correction

- [ ] ✅ Convertir `dashboard-medecin/page.tsx` en composant React
- [ ] ✅ Supprimer la validation de mot de passe sur login
- [ ] ✅ Ajouter la vérification de rôle dans les dashboards
- [ ] ✅ Gérer le champ 2FA (supprimer ou implémenter)
- [ ] ✅ Améliorer la gestion d'erreurs
- [ ] ✅ Tester l'inscription avec rôle médecin
- [ ] ✅ Tester la connexion et redirection
- [ ] ✅ Vérifier que les rôles sont correctement assignés en base

---

## 🎯 Priorité des Corrections

1. **CRITIQUE** : Convertir dashboard-medecin en composant React
2. **IMPORTANT** : Supprimer validation mot de passe sur login
3. **MOYEN** : Ajouter vérification de rôle
4. **FAIBLE** : Gérer le champ 2FA
5. **FAIBLE** : Améliorer gestion d'erreurs

Le problème principal est que le dashboard médecin n'est pas un composant React fonctionnel, ce qui empêche l'utilisation des hooks d'authentification et cause des erreurs de navigation.