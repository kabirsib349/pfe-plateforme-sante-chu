'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
import { getFormulaireById, updateFormulaire } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { ArrowLeftIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { ToastContainer } from "@/src/components/ToastContainer";
import { MESSAGES } from "@/src/constants/messages";
import { ThemeMedical } from "@/src/constants/themes";
import { ChampRequest, Formulaire } from "@/src/types";
import { ThemeSelector } from "@/src/components/formulaire/ThemeSelector";
import { AddCustomQuestionModal } from "@/src/components/formulaire/AddCustomQuestionModal";
import { useThemes } from "@/src/hooks/useThemes";
import { ConfirmationModal } from "@/src/components/ui/ConfirmationModal";
import { useFormulaireBuilder } from "@/src/hooks/useFormulaireBuilder";

// Components atomiques
import { FormHeader } from "@/src/components/form-builder/FormHeader";
import { QuestionList } from "@/src/components/form-builder/QuestionList";

export default function ModifierFormulaire() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();
  const { triggerStatsRefresh } = useStatsRefresh();

  // -- UI State --
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [nomFormulaire, setNomFormulaire] = useState('');
  const [description, setDescription] = useState('');
  const [titreEtude, setTitreEtude] = useState('');
  const [modeAjout, setModeAjout] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rechercheTheme, setRechercheTheme] = useState('');
  const [nouveauxChampsIds, setNouveauxChampsIds] = useState<string[]>([]);

  // Custom Themes
  const { themes, addQuestion, customQuestions, deleteQuestion } = useThemes();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [themeToCustomize, setThemeToCustomize] = useState<ThemeMedical | null>(null);

  const formulaireId = params.id as string;

  // -- Hook Logic --
  const {
    champs,
    activeChampId,
    draggedItemId,
    historique,
    setChamps,
    ajouterChamp: hookAjouterChamp,
    supprimerChamp,
    modifierChamp,
    ajouterTheme: hookAjouterTheme,
    annulerDernierAjout,
    toutSupprimer: hookToutSupprimer,
    setActiveChampId,
    handleDragStart,
    handleDragEnd,
    handleDrop: hookHandleDrop,
    validateForm
  } = useFormulaireBuilder();


  // -- Load Data --
  useEffect(() => {
    const fetchFormulaire = async () => {
      if (!token || !formulaireId) return;

      try {
        const data: Formulaire = await getFormulaireById(token, parseInt(formulaireId));
        setNomFormulaire(data.titre);
        setDescription(data.description || data.etude.description || ''); // Fallback
        setTitreEtude(data.etude.titre);

        // Convert API Champs to Builder Champs
        const champsConverts: any[] = data.champs.map((champ, index) => ({
          id: champ.idChamp?.toString() || index.toString(),
          type: (champ.type as string).toLowerCase(), // cast to match hook expectation if needed
          nomVariable: champ.label.toUpperCase().replace(/\s+/g, '_'),
          question: champ.label,
          obligatoire: champ.obligatoire,
          options: champ.listeValeur?.options?.map((opt: any) => ({
            libelle: opt.libelle,
            valeur: opt.valeur
          })),
          valeurMin: champ.valeurMin,
          valeurMax: champ.valeurMax,
          unite: champ.unite || '',
          formuleCalcul: champ.type === 'calcule' ? (champ.unite?.split(':')[1]?.split('|')[0] || '') : undefined,
          champsRequis: champ.type === 'calcule' ? (champ.unite?.split('|')[1]?.split(',') || []) : undefined,
        }));

        setChamps(champsConverts);
      } catch (error) {
        const formattedError = handleError(error, 'FetchFormulaire');
        showToast(formattedError.userMessage, 'error');
        router.push('/formulaire');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFormulaire();
  }, [token, formulaireId, router, showToast, setChamps]);


  // -- UI Wrappers --
  const handleAjouterTheme = (theme: ThemeMedical) => {
    const ids = hookAjouterTheme(theme);
    setNouveauxChampsIds(ids);
    showToast(`Thème "${theme.nom}" ajouté avec ${ids.length} questions`, 'success');
    setTimeout(() => setNouveauxChampsIds([]), 1000);
  };

  const handleAnnuler = () => {
    if (annulerDernierAjout()) {
      showToast('Dernier ajout annulé', 'info');
    }
  };

  const handleToutSupprimer = () => {
    hookToutSupprimer();
    setShowDeleteModal(false);
    showToast('Toutes les questions ont été supprimées', 'info');
  };

  const handleAjouterChamp = (type: any) => {
    hookAjouterChamp(type);
    setModeAjout(false);
  };

  const handleCustomizeTheme = (theme: ThemeMedical) => {
    setThemeToCustomize(theme);
    setIsCustomModalOpen(true);
  };

  // -- Submission --
  const sauvegarderModifications = async (statut: 'BROUILLON' | 'PUBLIE') => {
    const errors = validateForm(titreEtude);
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }

    if (!token) return;

    setIsLoading(true);

    const payload = {
      titre: titreEtude,
      description: description,
      statut: statut,
      titreEtude: titreEtude,
      descriptionEtude: description,
      champs: champs.map((champ: any) => {
        // Same mapping logic
        if (champ.type === 'calcule') {
          return {
            label: champ.question,
            type: 'TEXTE',
            obligatoire: champ.obligatoire,
            unite: `CALCULE:${champ.formuleCalcul}|${champ.champsRequis?.join(',')}`,
          };
        }
        if (champ.type === 'choix_unique') {
          return {
            label: champ.question,
            type: 'CHOIX_MULTIPLE',
            obligatoire: champ.obligatoire,
            nomListeValeur: champ.nomVariable ? `LISTE_${champ.nomVariable}` : undefined,
            options: champ.options,
          };
        }

        const champData: ChampRequest = {
          label: champ.question,
          type: champ.type.toUpperCase(),
          obligatoire: champ.obligatoire,
        };

        if (champ.valeurMin !== undefined && champ.valeurMin !== null && champ.valeurMin >= 0) champData.valeurMin = champ.valeurMin;
        if (champ.valeurMax !== undefined && champ.valeurMax !== null && champ.valeurMax >= 0) champData.valeurMax = champ.valeurMax;
        if (champ.unite) champData.unite = champ.unite;

        if (champ.type === 'choix_multiple' && champ.nomVariable) {
          champData.nomListeValeur = `LISTE_${champ.nomVariable}`;
          champData.options = champ.options;
        }

        return champData;
      }),
    };

    try {
      await updateFormulaire(token, parseInt(formulaireId), payload);
      showToast('Formulaire mis à jour avec succès !', 'success');
      triggerStatsRefresh();
      setTimeout(() => {
        router.push('/formulaire');
      }, 1500);
    } catch (error) {
      const formattedError = handleError(error, 'UpdateFormulaire');
      showToast(`${MESSAGES.error.sauvegarde}: ${formattedError.userMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-gray-800" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Modifier : {nomFormulaire}</h1>
                  <p className="text-sm text-gray-800">Édition du formulaire et de l'étude associée</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/formulaire')} className="px-4 py-2 text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Annuler
                </button>
                <button onClick={() => sauvegarderModifications('BROUILLON')} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  <DocumentIcon className="w-4 h-4" />
                  {isLoading ? "Sauvegarde..." : "Enregistrer les modifications"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
          <ThemeSelector
            themes={themes}
            rechercheTheme={rechercheTheme}
            onRechercheChange={setRechercheTheme}
            onThemeSelect={handleAjouterTheme}
            onCustomizeTheme={handleCustomizeTheme}
            champsCount={champs.length}
          />

          <AddCustomQuestionModal
            isOpen={isCustomModalOpen}
            onClose={() => setIsCustomModalOpen(false)}
            onSave={addQuestion}
            theme={themeToCustomize}
            existingQuestions={customQuestions}
            onDelete={deleteQuestion}
          />

          <FormHeader
            titreEtude={titreEtude}
            setTitreEtude={setTitreEtude}
            description={description}
            setDescription={setDescription}
          />

          <QuestionList
            champs={champs}
            activeChampId={activeChampId}
            setActiveChampId={setActiveChampId}
            nouveauxChampsIds={nouveauxChampsIds}
            historiqueLength={historique.length}
            onUndo={handleAnnuler}
            onDeleteAll={() => setShowDeleteModal(true)}
            modeAjout={modeAjout}
            setModeAjout={setModeAjout}
            handleAjouterChamp={handleAjouterChamp}
            supprimerChamp={supprimerChamp}
            modifierChamp={modifierChamp}
            draggedItemId={draggedItemId}
            handleDragStart={(id) => handleDragStart(id)}
            handleDragEnd={handleDragEnd}
            handleDrop={hookHandleDrop}
          />
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleToutSupprimer}
        title="Tout supprimer ?"
        message={`Êtes-vous sûr de vouloir supprimer toutes les questions (${champs.length}) ?`}
        confirmText="Tout supprimer"
        variant="danger"
      />
    </>
  );
}