/**
 * Types centralisés pour toute l'application
 */

// ============= ENUMS =============

export enum Role {
  CHERCHEUR = 'chercheur',
  MEDECIN = 'medecin',
}

export enum StatutFormulaire {
  BROUILLON = 'BROUILLON',
  PUBLIE = 'PUBLIE',
}

export enum TypeChamp {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DATE = 'DATE',
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
}

// ============= USER & AUTH =============

export interface User {
  id?: number;
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

// ============= ETUDE =============

export interface Etude {
  idEtude?: number;
  titre: string;
  description?: string;
  dateCreation?: string;
  utilisateur?: User;
}

// ============= CHAMP =============

export interface OptionValeur {
  idOption?: number;
  libelle: string;
  valeur: string;
}

export interface ListeValeur {
  idListeValeur?: number;
  nom: string;
  options: OptionValeur[];
}

export interface Champ {
  idChamp: number;
  label: string;
  type: TypeChamp | string;
  obligatoire: boolean;
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  listeValeur?: ListeValeur;
  ordre?: number;
}

// ============= FORMULAIRE =============

export interface Formulaire {
  idFormulaire: number;
  titre: string;
  description?: string;
  dateCreation: string;
  dateModification?: string;
  statut: StatutFormulaire | string;
  chercheur: User;
  etude?: Etude;
  champs: Champ[];
}

export interface FormulaireRequest {
  titre: string;
  description?: string;
  statut: string;
  titreEtude: string;
  descriptionEtude?: string;
  champs: ChampRequest[];
}

export interface ChampRequest {
  id?: string;
  label: string;
  type: string;
  obligatoire: boolean;
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  nomListeValeur?: string;
  options?: OptionValeur[];
}

// ============= FORMULAIRE MEDECIN =============

export interface FormulaireMedecin {
  id: number;
  formulaire: Formulaire;
  medecin: User;
  chercheur: User;
  dateEnvoi: string;
  statut: StatutFormulaire | string;
  lu: boolean;
  dateLecture?: string;
  complete: boolean;
  dateCompletion?: string;
  masquePourMedecin: boolean;
  masquePourChercheur: boolean;
}

export interface FormulaireRecuResponse {
  id: number;
  formulaire: Formulaire;
  chercheur: User;
  dateEnvoi: string;
  lu: boolean;
  complete: boolean;
  dateCompletion?: string;
}

export interface FormulaireEnvoyeResponse {
  id: number;
  formulaire: Formulaire;
  medecin: User;
  dateEnvoi: string;
  complete: boolean;
  dateCompletion?: string;
}

// ============= REPONSE =============

export interface ReponseFormulaire {
  idReponse: number;
  champ: Champ;
  valeur: string;
  dateSaisie: string;
}

export interface ReponseFormulaireRequest {
  formulaireMedecinId: number;
  reponses: Record<string, string>;
}

// ============= STATS =============

export interface Stats {
  totalFormulaires: number;
  brouillons: number;
  envoyes: number;
  activiteRecente: Activite[];
}

export interface Activite {
  idActivite: number;
  action: string;
  details: string;
  dateCreation: string;
  utilisateur: User;
}

// ============= API RESPONSES =============

export interface ApiError {
  message: string;
  status?: number;
  timestamp?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// ============= COMMON =============

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
