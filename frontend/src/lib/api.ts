
export async function registerMedecin(data: { email: string; password: string }) {
    const res = await fetch("http://localhost:8080/api/medecins/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec de l'inscription");
    }

    return res.json();
}

export async function loginMedecin(data: { email: string; password: string; code2FA?: string }) {
    const res = await fetch("http://localhost:8080/api/medecins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec de la connexion");
    }

    return res.json(); // doit renvoyer { token, email, role } depuis ton backend
}
