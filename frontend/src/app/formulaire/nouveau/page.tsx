"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  PlusIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  DocumentIcon,
  HashtagIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ChartBarIcon,
  RocketLaunchIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  BeakerIcon
} from "@heroicons/react/24/outline";
import { TYPES_ETUDES } from "@/src/constants/etudes";

// Interface simplifiée pour médecins 
type TypeChamp = 'texte' | 'nombre' | 'date' | 'choix-unique' | 'choix-multiple' | 'echelle' | 'texte-long' | 'calcule';

interface ChampFormulaire {
  id: string;
  type: TypeChamp;
  nomVariable: string;
  question: string;
  obligatoire: boolean;
  options?: string[];
  codesModalites?: string[];
  unite?: string;
  min?: number;
  max?: number;
  formuleCalcul?: string;
  champsRequis?: string[];
}

// Fonctions de validation
const validerNomVariable = (nomVariable: string, champsExistants: ChampFormulaire[]): string | null => {
  if (nomVariable !== nomVariable.toUpperCase()) {
    return "Le nom de variable doit être écrit en MAJUSCULE";
  }
  if (nomVariable.length > 25) {
    return "Le nom de variable ne doit pas dépasser 25 caractères";
  }
  const regex = /^[A-Z0-9_]+$/;
  if (!regex.test(nomVariable)) {
    return "Le nom de variable ne doit contenir que des lettres majuscules, chiffres et underscore (_)";
  }
  const existant = champsExistants.find(c => c.nomVariable === nomVariable);
  if (existant) {
    return "Ce nom de variable existe déjà";
  }
  return null;
};

const validerModalites = (options: string[], codes: string[]): string | null => {
  if (!options || !codes) return null;
  if (options.length !== codes.length) {
    return "Chaque modalité doit avoir un code correspondant";
  }
  for (let i = 0; i < options.length; i++) {
    const option = options[i].toLowerCase();
    const code = codes[i];
    if (option === 'oui' && code !== '1') {
      return "La modalité 'OUI' doit avoir le code '1'";
    }
    if (option === 'non' && code !== '0') {
      return "La modalité 'NON' doit avoir le code '0'";
    }
  }
  return null;
};

export default function NouveauFormulaire() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nomFormulaire, setNomFormulaire] = useState('');
  const [description, setDescription] = useState('');
  const [etude, setEtude] = useState('');
  const [nomCreateur, setNomCreateur] = useState('');
  const [champs, setChamps] = useState<ChampFormulaire[]>([]);
  const [modeAjout, setModeAjout] = useState(false);
  const [modeApercu, setModeApercu] = useState(false);

  const ajouterChamp = (type: TypeChamp) => {
    const nouveauChamp: ChampFormulaire = {
      id: Date.now().toString(),
      type,
      nomVariable: '',
      question: '',
      obligatoire: false,
      options: type === 'choix-unique' || type === 'choix-multiple' ? ['Oui', 'Non'] : undefined,
      codesModalites: type === 'choix-unique' || type === 'choix-multiple' ? ['1', '0'] : undefined,
      unite: type === 'nombre' ? '' : undefined,
      min: type === 'echelle' ? 0 : undefined,
      max: type === 'echelle' ? 10 : undefined,
      formuleCalcul: type === 'calcule' ? 'POIDS/(TAILLE^2)' : undefined,
      champsRequis: type === 'calcule' ? ['POIDS', 'TAILLE'] : undefined
    };
    setChamps([...champs, nouveauChamp]);
    setModeAjout(false);
  };

  const supprimerChamp = (id: string) => {
    setChamps(champs.filter(c => c.id !== id));
  };

  const modifierChamp = (id: string, nouvelleValeur: Partial<ChampFormulaire>) => {
    setChamps(champs.map(c => c.id === id ? { ...c, ...nouvelleValeur } : c));
  };

  const sauvegarderFormulaire = async (statut: string) => {
    if (!nomFormulaire.trim()) {
      alert('Veuillez saisir un nom pour le formulaire');
      return;
    }
    if (!nomCreateur.trim()) {
      alert('Veuillez saisir votre nom en tant que créateur du formulaire');
      return;
    }

    setIsLoading(true);
    try {
      const formulaireData = {
        nom: nomFormulaire,
        description,
        etude: etude || 'Général',
        statut: statut,
        createurNom: nomCreateur,
        nombreChamps: champs.length,
        structure: JSON.stringify({
          champs,
          rgpdCompliant: true,
          exportCSV: true,
          dateCreation: new Date().toISOString()
        })
      };

      console.log('Formulaire médical sauvegardé:', formulaireData);
      const message = statut === 'Brouillon' 
        ? 'Formulaire sauvé en brouillon !'
        : 'Formulaire validé et publié !';
      alert(message);
      router.push('/formulaire');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push('/dashboard-chercheur')}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            <span>›</span>
            <button 
              onClick={() => router.push('/formulaire')}
              className="hover:text-blue-600 transition-colors"
            >
              Formulaires
            </button>
            <span>›</span>
            <span className="text-gray-900 font-medium">Nouveau</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Nouveau formulaire médical</h1>
                <p className="text-sm text-gray-600">Créez un nouveau protocole d'évaluation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/formulaire')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => sauvegarderFormulaire('Brouillon')}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <DocumentIcon className="w-4 h-4" />
                {isLoading ? "Sauvegarde..." : "Sauver en brouillon"}
              </button>
              <button
                onClick={() => sauvegarderFormulaire('Validé')}
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? "Publication..." : "Valider et publier"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Informations du formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Informations du formulaire</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du formulaire *</label>
              <input
                type="text"
                value={nomFormulaire}
                onChange={(e) => setNomFormulaire(e.target.value)}
                placeholder="Ex: Consultation cardiologique"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'étude</label>
              <select
                value={etude}
                onChange={(e) => setEtude(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                {TYPES_ETUDES.map(etude => (
                  <option key={etude.value} value={etude.value}>
                    {etude.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créé par *</label>
              <input
                type="text"
                value={nomCreateur}
                onChange={(e) => setNomCreateur(e.target.value)}
                placeholder="Ex: Dr. Marie Dubois"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez brièvement l'objectif de ce formulaire..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Liste des questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Questions du formulaire ({champs.length})</h2>
            </div>
            <button
              onClick={() => setModeAjout(!modeAjout)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter une question
            </button>
          </div>

          {/* Sélecteur de type de question */}
          {modeAjout && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-3">Choisissez le type de question :</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onClick={() => ajouterChamp('texte')} className="p-3 bg-white rounded-lg border hover:border-blue-300 text-left transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                    Texte court
                  </div>
                  <div className="text-xs text-gray-600">Nom, prénom, etc.</div>
                </button>
                <button onClick={() => ajouterChamp('nombre')} className="p-3 bg-white rounded-lg border hover:border-blue-300 text-left transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <HashtagIcon className="w-4 h-4 text-blue-600" />
                    Nombre
                  </div>
                  <div className="text-xs text-gray-600">Âge, poids, tension</div>
                </button>
                <button onClick={() => ajouterChamp('date')} className="p-3 bg-white rounded-lg border hover:border-blue-300 text-left transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                    Date
                  </div>
                  <div className="text-xs text-gray-600">Date de naissance</div>
                </button>
                <button onClick={() => ajouterChamp('choix-unique')} className="p-3 bg-white rounded-lg border hover:border-blue-300 text-left transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    Choix unique
                  </div>
                  <div className="text-xs text-gray-600">Sexe, groupe sanguin</div>
                </button>
              </div>
            </div>
          )}

          {/* Questions existantes */}
          <div className="space-y-3">
            {champs.map((champ, index) => (
              <div key={champ.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={champ.question}
                      onChange={(e) => modifierChamp(champ.id, { question: e.target.value })}
                      placeholder="Question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                    />
                    <input
                      type="text"
                      value={champ.nomVariable}
                      onChange={(e) => modifierChamp(champ.id, { nomVariable: e.target.value.toUpperCase() })}
                      placeholder="NOM_VARIABLE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      maxLength={25}
                    />
                  </div>
                  <button
                    onClick={() => supprimerChamp(champ.id)}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {champs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune question ajoutée.</p>
                <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}