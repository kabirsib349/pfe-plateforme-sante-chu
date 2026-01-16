import {
  UserIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  BeakerIcon
} from "@heroicons/react/24/outline";
import { TypeChamp } from "@/src/components/form-builder/Question";

export interface ChampTemplate {
  type: TypeChamp;
  question: string;
  nomVariable: string;
  obligatoire: boolean;
  options?: { libelle: string; valeur: string }[];
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  formuleCalcul?: string;
  champsRequis?: string[];
}

export interface ThemeMedical {
  nom: string;
  description: string;
  icon: React.ElementType;
  champs: ChampTemplate[];
}

export const themesMedicaux: ThemeMedical[] = [
  {
    nom: "IDENTITE PATIENT",
    description: "Information sur le patient",
    icon: UserIcon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Sexe',
        nomVariable: 'SEXE',
        obligatoire: true,
        options: [
          { libelle: 'Masculin', valeur: '0' },
          { libelle: 'Féminin', valeur: '1' }
        ]
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Age',
        nomVariable: 'AGE',
        unite: 'années',
        obligatoire: true
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Taille',
        nomVariable: 'TAILLE',
        unite: 'cm',
        obligatoire: true
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Poids',
        nomVariable: 'POIDS',
        unite: 'kg',
        obligatoire: true
      },
      {
        type: 'calcule' as TypeChamp,
        question: 'IMC',
        nomVariable: 'IMC',
        obligatoire: true,
        formuleCalcul: 'POIDS/((TAILLE/100)^2)',
        champsRequis: ['POIDS', 'TAILLE']
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'ASA',
        nomVariable: 'ASA',
        obligatoire: true,
        valeurMin: 1,
        valeurMax: 3
      },
      {
        type: 'choix_multiple' as TypeChamp,
        question: 'Type de chirurgie prevue',
        nomVariable: 'CHIRURGIE_PROGRAMMEE',
        obligatoire: true,
        options: [
          { libelle: 'PTH', valeur: '1' },
          { libelle: 'PTG', valeur: '2' },
          { libelle: 'PUC', valeur: '3' }
        ]
      }
    ]
  },
  {
    nom: "ANTECEDENTS",
    description: "Historique médical et pathologies",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Traitement antiplaquettaire',
        nomVariable: 'ANTI_AGG_PLAQ',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'texte' as TypeChamp,
        question: 'Nom du traitement antiplaquettaire le cas échéant',
        nomVariable: 'ANTI_AGG_PLAQ_CPL',
        obligatoire: true
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Traitement Beta-bloquant',
        nomVariable: 'BETA_BLOQUANT',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'texte' as TypeChamp,
        question: 'Nom du traitement beta-bloquant le cas échéant',
        nomVariable: 'BETA_BLOQUANT_CPL',
        obligatoire: true
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Chimiothérapie',
        nomVariable: 'CHIMIOTHERAPIE',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'texte' as TypeChamp,
        question: 'Nom de la chimiothérapie le cas échéant',
        nomVariable: 'CHIMIOTHERAPIE_CPL',
        obligatoire: true
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Autres traitements habituels',
        nomVariable: 'AUTRES_TTT',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'texte' as TypeChamp,
        question: 'Nom des autres traitements le cas échéant',
        nomVariable: 'AUTRES_TTT_CPL',
        obligatoire: true
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Antécédents cardiovasculaires',
        nomVariable: 'ATCD_CV',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
    ]
  },
  {
    nom: "SEJOUR HOPITAL",
    description: "Informations sur lhospitalisation",
    icon: BuildingOffice2Icon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Lieu avant le séjour à lhospital',
        nomVariable: 'PROVENANCE',
        obligatoire: true,
        options: [
          { libelle: 'DOMICILE', valeur: '1' },
          { libelle: 'AUTRE ETABLISSEMENT', valeur: '2' }
        ]
      },
      {
        type: 'date' as TypeChamp,
        question: 'Date dentrée à lhospital',
        nomVariable: 'DATE_ENTREE',
        obligatoire: true
      },
      {
        type: 'choix_multiple' as TypeChamp,
        question: 'Lieu après le séjour à lhospital',
        nomVariable: 'DESTINATION',
        obligatoire: true,
        options: [
          { libelle: 'DOMICILE', valeur: '1' },
          { libelle: 'AUTRE ETABLISSEMENT', valeur: '2' },
          { libelle: 'SSR', valeur: '3' },
          { libelle: 'HAD', valeur: '4' }
        ]
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Parcours RAAC',
        nomVariable: 'RAAC',
        obligatoire: true,
        options: [
          { libelle: 'OUI', valeur: '1' },
          { libelle: 'NON', valeur: '0' }
        ]
      },
    ]
  },
  {
    nom: "CONSULTATION",
    description: "Informations sur la consultation",
    icon: BuildingOffice2Icon,
    champs: [
      {
        type: 'date' as TypeChamp,
        question: 'Consultation de chirurgie',
        nomVariable: 'SURGERYCDATE',
        obligatoire: true,
      },
      {
        type: 'date' as TypeChamp,
        question: 'Consultation danesthésie',
        nomVariable: 'ANESTHCDATE',
        obligatoire: true
      },
    ]
  },
  {
    nom: "BILAN PRE OPERATOIRE",
    description: "Paramètres vitaux et examens complémentaires",
    icon: BeakerIcon,
    champs: [
      {
        type: 'choix_multiple' as TypeChamp,
        question: 'Bilan',
        nomVariable: 'BILAN',
        obligatoire: true,
        options: [
          { libelle: 'En Ville', valeur: '1' },
          { libelle: 'ETBS', valeur: '2' }
        ]
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Ferritine',
        nomVariable: 'PREOP_FERRI',
        unite: 'mmHg',
        obligatoire: true
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Fréquence cardiaque',
        nomVariable: 'FC',
        unite: 'bpm',
        obligatoire: false
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Température corporelle',
        nomVariable: 'TEMPERATURE',
        unite: '°C',
        obligatoire: false
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Échelle de douleur',
        nomVariable: 'DOULEUR',
        obligatoire: false,
        valeurMin: 0,
        valeurMax: 10
      }
    ]
  },
  {
    nom: "PER OPERATOIRE",
    description: "Données per-opératoires",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Type danesthésie',
        nomVariable: 'TYPE_ANESTHESIE',
        obligatoire: true,
        options: [
          { libelle: 'Générale', valeur: '1' },
          { libelle: 'Péridurale', valeur: '2' },
          { libelle: 'Rachianesthésie', valeur: '3' }
        ]
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Durée de lintervention',
        nomVariable: 'DUREE_INTERVENTION',
        unite: 'minutes',
        obligatoire: true
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Complications per-opératoires',
        nomVariable: 'COMPLICATIONS_PEROP',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
    ]
  },
  {
    nom: "POST OPERATOIRE",
    description: "Suivi post-opératoire immédiat",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'date' as TypeChamp,
        question: 'Date de sortie de salle de réveil',
        nomVariable: 'DATE_SORTIE_SR',
        obligatoire: true
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Score de douleur à la sortie',
        nomVariable: 'DOULEUR_SORTIE',
        obligatoire: true,
        valeurMin: 0,
        valeurMax: 10
      },
      {
        type: 'choix_multiple' as TypeChamp,
        question: 'Antalgiques administrés',
        nomVariable: 'ANTALGIQUES',
        obligatoire: true,
        options: [
          { libelle: 'Paracétamol', valeur: '1' },
          { libelle: 'Tramadol', valeur: '2' },
          { libelle: 'Morphine', valeur: '3' }
        ]
      },
    ]
  },
  {
    nom: "TRANSFUSION",
    description: "Produits sanguins transfusés",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Transfusion per-opératoire',
        nomVariable: 'TRANSFUSION_PEROP',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Nombre de culots globulaires',
        nomVariable: 'NB_CULOTS',
        obligatoire: false
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Transfusion post-opératoire',
        nomVariable: 'TRANSFUSION_POSTOP',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
    ]
  },
  {
    nom: "RECUPERATION",
    description: "Suivi de la récupération et réhabilitation",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'date' as TypeChamp,
        question: 'Date correspondant au J1 de la chirurgie',
        nomVariable: 'J1',
        obligatoire: true
      },
      {
        type: 'date' as TypeChamp,
        question: 'Date de fin du traitement antiplaquettaire',
        nomVariable: 'ANTI_AGG_PLAQ_DATE_FIN',
        obligatoire: true
      },
      {
        type: 'nombre' as TypeChamp,
        question: 'Distance marchée au J3',
        nomVariable: 'DISTANCE_MARCHE_J3',
        unite: 'mètres',
        obligatoire: false
      },
    ]
  },
  {
    nom: "COMPLICATIONS",
    description: "Complications post-opératoires",
    icon: ClipboardDocumentListIcon,
    champs: [
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Complications infectieuses',
        nomVariable: 'COMPLICATIONS_INFECTIEUSES',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Complications thromboemboliques',
        nomVariable: 'COMPLICATIONS_THROMBO',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
      {
        type: 'choix_unique' as TypeChamp,
        question: 'Réadmission sous 30 jours',
        nomVariable: 'READMISSION_30J',
        obligatoire: true,
        options: [
          { libelle: 'Oui', valeur: '1' },
          { libelle: 'Non', valeur: '0' }
        ]
      },
    ]
  },
];
