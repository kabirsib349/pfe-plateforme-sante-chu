"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, ClipboardDocumentListIcon, CalendarDaysIcon, HashtagIcon, DocumentTextIcon, CheckCircleIcon, UserIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// Types correspondant au backend
interface ChampFormulaire {
  nomVariable: string;
  question: string;
  type: 'TEXTE' | 'TEXTE_LONG' | 'NOMBRE' | 'DATE' | 'CHOIX_UNIQUE' | 'CHOIX_MULTIPLE' | 'ECHELLE' | 'CALCULE';
  obligatoire: boolean;
  options?: string[];
  codesModalites?: string[];
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  formuleCalcul?: string;
}

interface FormulaireApercu {
  idFormulaire: number;
  titre: string;
  description: string;
  etude: string;
  createurNom: string;
  statut: string;
  dateCreation: string;
  champs: ChampFormulaire[];
}

function ApercuFormulaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formulaireId = searchParams.get('id');

  // Données mockées pour l'instant (sera remplacé par API call)
  const formulaire: FormulaireApercu = {
    idFormulaire: 1,
    titre: "Protocole Évaluation Cardiovasculaire",
    description: "Formulaire de suivi post-opératoire pour patients cardiaques",
    etude: "CARDIO-2025",
    createurNom: "Dr. Marie Dubois",
    statut: "PUBLIE",
    dateCreation: "2025-10-15",
    champs: [
      {
        nomVariable: "AGE_PATIENT",
        question: "Quel est l'âge du patient en années complètes ?",
        type: "NOMBRE",
        obligatoire: true,
        unite: "ans",
        valeurMin: 0,
        valeurMax: 120
      },
      {
        nomVariable: "POIDS_KG",
        question: "Poids du patient",
        type: "NOMBRE",
        obligatoire: true,
        unite: "kg",
        valeurMin: 1,
        valeurMax: 300
      },
      {
        nomVariable: "DIABETIQUE",
        question: "Le patient est-il diabétique ?",
        type: "CHOIX_UNIQUE",
        obligatoire: true,
        options: ["Oui", "Non", "Ne sait pas"],
        codesModalites: ["1", "0", "9"]
      },
      {
        nomVariable: "DOULEUR_ECHELLE",
        question: "Niveau de douleur ressentie (échelle de 1 à 10)",
        type: "ECHELLE",
        obligatoire: false,
        valeurMin: 1,
        valeurMax: 10
      },
      {
        nomVariable: "IMC_CALCULE",
        question: "Indice de Masse Corporelle (calculé automatiquement)",
        type: "CALCULE",
        obligatoire: false,
        formuleCalcul: "POIDS_KG/(TAILLE_CM/100)^2"
      }
    ]
  };

  const renderChampPreview = (champ: ChampFormulaire, index: number) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'TEXTE': return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
        case 'TEXTE_LONG': return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
        case 'NOMBRE': return <HashtagIcon className="w-4 h-4 text-green-600" />;
        case 'DATE': return <CalendarDaysIcon className="w-4 h-4 text-purple-600" />;
        case 'CHOIX_UNIQUE': return <CheckCircleIcon className="w-4 h-4 text-orange-600" />;
        case 'CHOIX_MULTIPLE': return <ClipboardDocumentListIcon className="w-4 h-4 text-orange-600" />;
        case 'ECHELLE': return <div className="w-4 h-4 bg-indigo-600 rounded text-xs text-white flex items-center justify-center">═</div>;
        case 'CALCULE': return <div className="w-4 h-4 bg-gray-600 rounded text-xs text-white flex items-center justify-center">f(x)</div>;
        default: return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
      }
    };

    return (
      <div key={champ.nomVariable} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* En-tête du champ */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(champ.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
              {champ.obligatoire && (
                <span className="text-red-500 text-sm font-medium">*</span>
              )}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {champ.nomVariable}
              </span>
            </div>
            <h3 className="text-base font-medium text-gray-900 mt-1">
              {champ.question}
            </h3>
          </div>
        </div>

        {/* Prévisualisation du champ selon le type */}
        <div className="ml-7">
          {champ.type === 'TEXTE' && (
            <input 
              type="text" 
              placeholder="Saisie de texte..."
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          )}

          {champ.type === 'TEXTE_LONG' && (
            <textarea 
              placeholder="Saisie de texte long..."
              rows={3}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          )}

          {champ.type === 'NOMBRE' && (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="0"
                min={champ.valeurMin}
                max={champ.valeurMax}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
              {champ.unite && (
                <span className="text-gray-600 font-medium">{champ.unite}</span>
              )}
              {champ.valeurMin !== undefined && champ.valeurMax !== undefined && (
                <span className="text-sm text-gray-500">
                  (entre {champ.valeurMin} et {champ.valeurMax})
                </span>
              )}
            </div>
          )}

          {champ.type === 'DATE' && (
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          )}

          {champ.type === 'CHOIX_UNIQUE' && (
            <div className="space-y-2">
              {champ.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-2 text-gray-700">
                  <input 
                    type="radio" 
                    name={champ.nomVariable}
                    value={champ.codesModalites?.[idx] || idx.toString()}
                    className="text-blue-600"
                    disabled
                  />
                  <span>{option}</span>
                  {champ.codesModalites && (
                    <span className="text-xs text-gray-500">
                      (code: {champ.codesModalites[idx]})
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          {champ.type === 'CHOIX_MULTIPLE' && (
            <div className="space-y-2">
              {champ.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-2 text-gray-700">
                  <input 
                    type="checkbox" 
                    value={champ.codesModalites?.[idx] || idx.toString()}
                    className="text-blue-600"
                    disabled
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {champ.type === 'ECHELLE' && (
            <div className="space-y-2">
              <input 
                type="range" 
                min={champ.valeurMin || 1} 
                max={champ.valeurMax || 10}
                className="w-64"
                disabled
              />
              <div className="flex justify-between text-sm text-gray-600 w-64">
                <span>{champ.valeurMin || 1}</span>
                <span>{Math.floor(((champ.valeurMax || 10) + (champ.valeurMin || 1)) / 2)}</span>
                <span>{champ.valeurMax || 10}</span>
              </div>
            </div>
          )}

          {champ.type === 'CALCULE' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">
                  Champ calculé automatiquement
                </span>
              </div>
              {champ.formuleCalcul && (
                <p className="text-xs text-blue-700 mt-1">
                  Formule: {champ.formuleCalcul}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'BROUILLON':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">Brouillon</span>;
      case 'PUBLIE':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Publié</span>;
      case 'ARCHIVE':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Archivé</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{statut}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
            <span className="text-gray-900 font-medium">Aperçu</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Retour
              </button>
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Aperçu du formulaire</h1>
              </div>
            </div>
            {getStatutBadge(formulaire.statut)}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Informations du formulaire */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formulaire.titre}</h2>
              {formulaire.description && (
                <p className="text-gray-600 mt-2">{formulaire.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Créé par: {formulaire.createurNom}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-4 h-4" />
                <span>Étude: {formulaire.etude}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>Créé le: {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span>{formulaire.champs.length} question(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu des champs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
            Questions du formulaire
          </h3>
          {formulaire.champs.map((champ, index) => renderChampPreview(champ, index))}
        </div>

        {/* Footer de simulation */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-center gap-4">
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              Sauvegarder (Aperçu)
            </button>
            <button 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              Annuler (Aperçu)
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            <span className="inline-flex items-center justify-center gap-2">
              <InformationCircleIcon className="w-4 h-4 text-gray-400" />
              <span>Ceci est un aperçu - aucune donnée ne sera sauvegardée</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ApercuFormulaire() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        </div>
      </div>
    }>
      <ApercuFormulaireContent />
    </Suspense>
  );
}