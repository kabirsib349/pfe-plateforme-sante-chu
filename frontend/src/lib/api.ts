export async function register(data: { nom: string; email: string; password: string; role: string }) {
    const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec de l'inscription");
    }

    return res.text();
}

export async function login(data: { email: string; password: string }) {
    const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec de la connexion");
    }

    return res.json();
}

export async function getUserInfo(token: string){
    if(!token){
        return Promise.reject(new Error("No token provided"));
    }
    const res = await fetch("http://localhost:8080/api/users/me",{
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if(!res.ok){
        throw new Error("Echec de la récupération des informations utilisateur")
    }
    return res.json();
}

export async function getMedecins(token: string) {
    const res = await fetch("http://localhost:8080/api/users/medecins", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error("Échec du chargement des médecins");
    }
    return res.json();
}

export async function sendFormulaireToMedecin(token: string, formulaireId: number, emailMedecin: string) {
    const res = await fetch(`http://localhost:8080/api/formulaires/${formulaireId}/envoyer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ emailMedecin })
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Échec de l'envoi du formulaire");
        } else {
            const errorText = await res.text();
            throw new Error(errorText || "Échec de l'envoi du formulaire");
        }
    }
    return res;
}