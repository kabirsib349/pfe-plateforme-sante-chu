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
        throw new Error("Echec de la récurépartion des informations utilisateur")
    }
    return res.json();
}