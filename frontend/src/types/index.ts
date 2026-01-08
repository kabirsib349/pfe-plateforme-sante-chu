/**
 * Types centralisés pour toute l'application
 */

// ============= ENUMS =============

export enum Role {
  CHERCHEUR = 'chercheur',
  MEDECIN = 'medecin',
  ADMIN = 'admin',
}

export enum StatutFormulaire {
  BROUILLON = 'BROUILLON',
  PUBLIE = 'PUBLIE',
  ARCHIVE = 'ARCHIVE',
}

export enum TypeChamp {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DATE = 'DATE',
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
  CASE_A_COCHER = 'CASE_A_COCHER',
}

// ============= USER & AUTH =============

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

export interface Message {
  id: number;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
  emetteur: User;
  destinataire: User;
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

// ============= CHAMP COMPONENTS =============

export interface OptionValeur {
  valeur: string;
  libelle: string;
}

export interface ListeValeur {
  idListeValeur?: number;
  nom: string;
  options: OptionValeur[];
}

export interface Champ {
  idChamp?: number;
  label: string;
  type: TypeChamp | string;
  obligatoire: boolean;
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  categorie?: string;
  ordre?: number;
  listeValeur?: ListeValeur;
  // Propriété purement frontend pour l'édition
  options?: OptionValeur[];
  tempId?: string;
}

// ============= FORMULAIRE =============

// Interface "Virtuelle" pour compatibilité Frontend (Shim Backend)
export interface Etude {
  titre: string;
  description?: string;
}

export interface Formulaire {
  idFormulaire: number;
  titre: string;
  description?: string;
  statut: StatutFormulaire | string;
  dateCreation: string;
  dateModification?: string;
  chercheur?: User;
  etude: Etude; // Le Backend renvoie toujours cet objet shim
  champs: Champ[];
}

export interface FormulaireRequest {
  titre: string;
  description?: string;
  statut: string;
  // Anciens champs, maintenus pour le mapping si nécessaire ou supprimés si le back ne les attend plus
  // Le backend attend "titreEtude" dans createFormulaire, mais en réalité c'est le titre formulaire
  titreEtude: string;
  descriptionEtude?: string;
  champs: ChampRequest[];
}

export interface ChampRequest {
  id?: number;
  label: string;
  type: string;
  obligatoire: boolean;
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  categorie?: string;
  nomListeValeur?: string;
  options?: OptionValeur[];
}

// ============= FORMULAIRE MEDECIN & ENVOI =============

export interface EnvoiFormulaireRequest {
  emailMedecin: string;
}

export interface FormulaireMedecin {
  id: number;
  formulaire: Formulaire;
  medecin?: User;
  chercheur?: User;
  dateEnvoi: string;
  statut?: string;
  lu: boolean;
  complete: boolean;
  dateCompletion?: string;
}

// DTOs spécifiques renvoyés par les endpoints /recus et /envoyes
export interface FormulaireRecuResponse {
  id: number;
  formulaire: Formulaire;
  chercheur: User;
  dateEnvoi: string;
  statut: string;
  lu: boolean;
  complete: boolean;
}

export interface FormulaireEnvoyeResponse {
  id: number;
  formulaire: Formulaire;
  medecin: User;
  dateEnvoi: string;
  lu: boolean;
  complete: boolean;
  dateCompletion?: string;
}

// ============= REPONSE =============

export interface ReponseFormulaire {
  idReponse: number;
  valeur: string;
  dateSaisie: string;
  champ: Champ;
}

export interface ReponseFormulaireRequest {
  formulaireMedecinId: number;
  reponses: Record<string, string>; // Map<idChamp, valeur>
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

// ============= API COMMON =============

export interface ApiError {
  message: string;
  status?: number;
  timestamp?: string;
  errors?: Record<string, string>; // Pour les erreurs de validation
}
