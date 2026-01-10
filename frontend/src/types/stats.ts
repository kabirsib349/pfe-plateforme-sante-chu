import { User } from './user';

export interface Activite {
    idActivite: number;
    action: string;
    details: string;
    dateCreation: string;
    utilisateur: User;
}

export interface Stats {
    totalFormulaires: number;
    brouillons: number;
    envoyes: number;
    activiteRecente: Activite[];
}

export interface StatistiqueFormulaire {
    nombreReponsesCompletes: number;
    nombreReponsesEnCours: number;
}

export interface DraftSummary {
    patientIdentifier: string;
    patientHash: string;
    nombreReponses: number;
    derniereModification: string;
}
