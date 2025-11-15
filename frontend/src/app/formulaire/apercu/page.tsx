"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, ClipboardDocumentListIcon, CalendarDaysIcon, HashtagIcon, DocumentTextIcon, CheckCircleIcon, UserIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { getUserInfo, getFormulaireById } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";

// Types correspondant au backend
interface ChampFormulaire {
  nomVariable: string;
  question: string;
  type: 'TEXTE' | 'NOMBRE' | 'DATE' | 'CHOIX_MULTIPLE';
  obligatoire: boolean;
  options?: string[];
  codesModalites?: string[];
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
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
  const [formulaire, setFormulaire] = React.useState<FormulaireApercu | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Fonction pour obtenir le dashboard approprié selon le rôle
  const getDashboardPath = () => {
    return userRole === 'medecin' ? '/dashboard-medecin' : '/dashboard-chercheur';
  };

  const getFormulairesPath = () => {
    return userRole === 'medecin' ? '/dashboard-medecin' : '/formulaire';
  };

  React.useEffect(() => {
    const fetchFormulaire = async () => {
      if (!formulaireId) {
        setError('ID de formulaire manquant');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Récupérer le rôle de l'utilisateur
        const userData = await getUserInfo(token);
        setUserRole(userData.role);

        // Récupérer le formulaire
        const data = await getFormulaireById(token, parseInt(formulaireId));
        setFormulaire({
          idFormulaire: data.idFormulaire,
          titre: data.titre,
          description: data.description || '',
          etude: data.etude?.titre || 'N/A',
          createurNom: data.chercheur?.nom || 'N/A',
          statut: data.statut,
          dateCreation: data.dateCreation,
          champs: data.champs?.map((champ: any) => ({
            nomVariable: champ.label?.toUpperCase().replace(/\s+/g, '_') || 'VARIABLE',
            question: champ.label,
            type: champ.type?.toUpperCase() || 'TEXTE',
            obligatoire: champ.obligatoire || false,
            options: champ.listeValeur?.options?.map((opt: any) => opt.libelle) || [],
            codesModalites: champ.listeValeur?.options?.map((opt: any) => opt.valeur) || [],
            unite: champ.unite,
            valeurMin: champ.valeurMin,
            valeurMax: champ.valeurMax
          })) || []
        });
      } catch (err) {
        const formattedError = handleError(err, 'ApercuFormulaire');
        setError(formattedError.userMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormulaire();
  }, [formulaireId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  if (error || !formulaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Formulaire non trouvé'}</p>
          <button 
            onClick={() => router.push(getFormulairesPath())}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }



  const renderChampPreview = (champ: ChampFormulaire, index: number) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'TEXTE': return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
        case 'NOMBRE': return <HashtagIcon className="w-4 h-4 text-green-600" />;
        case 'DATE': return <CalendarDaysIcon className="w-4 h-4 text-purple-600" />;
        case 'CHOIX_MULTIPLE': return <CheckCircleIcon className="w-4 h-4 text-orange-600" />;
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
            <div className="space-y-1">
              <textarea 
                placeholder="Saisie de texte (max 500 caractères)..."
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
                rows={3}
                maxLength={500}
                disabled
              />
              <p className="text-xs text-gray-500">Maximum 500 caractères</p>
            </div>
          )}

          {champ.type === 'NOMBRE' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="0"
                  min={champ.valeurMin}
                  max={champ.valeurMax}
                  step="any"
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                />
                {champ.unite && (
                  <span className="text-gray-600 font-medium">{champ.unite}</span>
                )}
              </div>
              {((champ.valeurMin !== null && champ.valeurMin !== undefined) || (champ.valeurMax !== null && champ.valeurMax !== undefined)) && (
                <p className="text-xs text-gray-500">
                  {champ.valeurMin !== null && champ.valeurMin !== undefined && champ.valeurMax !== null && champ.valeurMax !== undefined
                    ? `Valeur entre ${champ.valeurMin} et ${champ.valeurMax}`
                    : champ.valeurMin !== null && champ.valeurMin !== undefined
                    ? `Valeur minimum: ${champ.valeurMin}`
                    : `Valeur maximum: ${champ.valeurMax}`}
                </p>
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

          {champ.type === 'CHOIX_MULTIPLE' && (
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
        </div>
      </div>
    );
  };

  const getStatutBadge = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case 'brouillon':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">Brouillon</span>;
      case 'envoye':
      case 'envoyé':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Envoyé</span>;
      case 'archive':
      case 'archivé':
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
              onClick={() => router.push(getDashboardPath())}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            <span>›</span>
            {userRole !== 'medecin' && (
              <>
                <button 
                  onClick={() => router.push('/formulaire')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Formulaires
                </button>
                <span>›</span>
              </>
            )}
            <span className="text-gray-900 font-medium">Aperçu</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(getFormulairesPath())}
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
              onClick={() => router.push(getFormulairesPath())}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Fermer l'aperçu
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