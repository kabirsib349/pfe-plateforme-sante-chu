
export enum Role {
    CHERCHEUR = 'chercheur',
    MEDECIN = 'medecin',
    ADMIN = 'admin',
}

export interface User {
    id: number;
    nom: string;
    email: string;
    role: Role | string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    nom: string;
    email: string;
    password: string;
    role: string;
}

export interface UserUpdateRequest {
    nom: string;
    email: string;
}

export interface ChangePasswordRequest {
    ancienMotDePasse: string;
    nouveauMotDePasse: string;
}
