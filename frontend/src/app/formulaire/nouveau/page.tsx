'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
import { createFormulaire } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  DocumentTextIcon,
  DocumentIcon,
  HashtagIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  BeakerIcon
} from "@heroicons/react/24/outline";
import Question, { ChampFormulaire, TypeChamp } from "@/src/components/form-builder/Question";
import { ToastContainer } from "@/src/components/ToastContainer";
import { MESSAGES } from "@/src/constants/messages";
import { themesMedicaux } from "@/src/constants/themes";
import { ThemeSelector } from "@/src/components/formulaire/ThemeSelector";
import { QuestionTypeSelector } from "@/src/components/formulaire/QuestionTypeSelector";
import { DeleteConfirmationModal } from "@/src/components/formulaire/DeleteConfirmationModal";

export default function NouveauFormulaire() {
  const router = useRouter();
  const { token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();
  const { triggerStatsRefresh } = useStatsRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [titreEtude, setTitreEtude] = useState('');
  const [champs, setChamps] = useState<ChampFormulaire[]>([]);
  const [modeAjout, setModeAjout] = useState(false);
  const [activeChampId, setActiveChampId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [historique, setHistorique] = useState<ChampFormulaire[][]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rechercheTheme, setRechercheTheme] = useState('');
  const [nouveauxChampsIds, setNouveauxChampsIds] = useState<string[]>([]);

  const ajouterTheme = (theme: any) => {
    // Sauvegarder l'état actuel dans l'historique
    setHistorique([...historique, champs]);

    const nouveauxChamps = theme.champs.map((champ: any) => ({
      ...champ,
      categorie: theme.nom,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Marquer les nouveaux champs pour l'animation
    const nouveauxIds = nouveauxChamps.map((c: ChampFormulaire) => c.id);
    setNouveauxChampsIds(nouveauxIds);

    setChamps([...champs, ...nouveauxChamps]);
    showToast(`Thème "${theme.nom}" ajouté avec ${nouveauxChamps.length} questions`, 'success');

    // Retirer l'animation après 1 seconde
    setTimeout(() => {
      setNouveauxChampsIds([]);
    }, 1000);
  };

  const annulerDernierAjout = () => {
    if (historique.length > 0) {
      const dernierEtat = historique[historique.length - 1];
      setChamps(dernierEtat);
      setHistorique(historique.slice(0, -1));
      showToast('Dernier ajout annulé', 'info');
    }
  };

  const toutSupprimer = () => {
    if (champs.length > 0) {
      setShowDeleteModal(true);
    }
  };

  const confirmerSuppression = () => {
    setHistorique([...historique, champs]);
    setChamps([]);
    setShowDeleteModal(false);
    showToast('Toutes les questions ont été supprimées', 'info');
  };

  const ajouterChamp = (type: TypeChamp) => {
    const nouveauChamp: ChampFormulaire = {
      id: Date.now().toString(),
      type,
      nomVariable: '',
      question: '',
      obligatoire: false,
      options: type === 'choix_multiple' ? [{ libelle: 'Oui', valeur: '1' }, { libelle: 'Non', valeur: '0' }] : undefined,
      unite: type === 'nombre' ? '' : undefined,
      formuleCalcul: type === 'calcule' ? 'POIDS/(TAILLE^2)' : undefined,
      champsRequis: type === 'calcule' ? ['POIDS', 'TAILLE'] : undefined
    };
    setChamps([...champs, nouveauChamp]);
    setModeAjout(false);
    setActiveChampId(nouveauChamp.id);
  };

  const supprimerChamp = (id: string) => {
    setChamps(champs.filter(c => c.id !== id));
  };

  const modifierChamp = (id: string, nouvelleValeur: Partial<ChampFormulaire>) => {
    setChamps(champs.map(c => c.id === id ? { ...c, ...nouvelleValeur } : c));
  };

  // Fonctions pour le drag & drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIndex = champs.findIndex(c => c.id === draggedItemId);
    const targetIndex = champs.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newChamps = [...champs];
    const [draggedItem] = newChamps.splice(draggedIndex, 1);
    newChamps.splice(targetIndex, 0, draggedItem);

    setChamps(newChamps);
    setDraggedItemId(null);
  };

  const sauvegarderFormulaire = async (statut: 'BROUILLON' | 'PUBLIE') => {
    // now only 'Etude' (titreEtude) is required
    if (!titreEtude.trim()) {
      showToast("Veuillez saisir le nom de l'étude (obligatoire).", 'error');
      return;
    }
    if (!token) {
      showToast('Authentification requise. Veuillez vous reconnecter.', 'error');
      return;
    }

    // Validation des champs
    const champsInvalides = champs.filter(c => !c.question.trim() || !c.nomVariable.trim());
    if (champsInvalides.length > 0) {
      showToast(`${champsInvalides.length} question(s) ont des champs vides (question ou nom de variable). Veuillez les compléter.`, 'error');
      return;
    }

    setIsLoading(true);

    const payload = {
      // We use the study title as the form title as well
      titre: titreEtude,
      // keep description empty at form level; study description sent in descriptionEtude
      description: '',
      statut: statut,
      titreEtude: titreEtude,
      descriptionEtude: description,
      champs: champs.map(champ => {
        if (champ.type === 'calcule') {
          return {
            label: champ.question,
            type: 'TEXTE',
            obligatoire: champ.obligatoire,
            unite: `CALCULE:${champ.formuleCalcul}|${champ.champsRequis?.join(',')}`,
            // Stocke les infos de calcul dans unite
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
        const champData: any = {
          label: champ.question,
          type: champ.type.toUpperCase(),
          obligatoire: champ.obligatoire,
        };

        // Ajouter valeurMin seulement si défini et >= 0
        if (champ.valeurMin !== undefined && champ.valeurMin !== null && champ.valeurMin >= 0) {
          champData.valeurMin = champ.valeurMin;
        }

        // Ajouter valeurMax seulement si défini et >= 0
        if (champ.valeurMax !== undefined && champ.valeurMax !== null && champ.valeurMax >= 0) {
          champData.valeurMax = champ.valeurMax;
        }

        // Ajouter unite seulement si défini
        if (champ.unite) {
          champData.unite = champ.unite;
        }

        // Ajouter nomListeValeur et options pour choix_multiple
        if (champ.type === 'choix_multiple' && champ.nomVariable) {
          champData.nomListeValeur = `LISTE_${champ.nomVariable}`;
          champData.options = champ.options;
        }

        return champData;
      }),
    };

    if (config.features.enableDebug) {
      console.log('[FormNouveau] Payload envoyé au backend:', JSON.stringify(payload, null, 2));
    }

    try {
      await createFormulaire(token!, payload);
      showToast('Formulaire sauvegardé avec succès !', 'success');
      triggerStatsRefresh();
      setTimeout(() => {
        router.push('/formulaire');
      }, 1500);
    } catch (error: any) {
      if (config.features.enableDebug) {
        console.error('[FormNouveau] Erreurs de validation:', error?.data?.errors);
      }

      // Afficher les erreurs de validation détaillées
      if (error?.data?.errors) {
        const errorDetails = Object.entries(error.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');

        if (config.features.enableDebug) {
          console.error('[FormNouveau] Détails:', errorDetails);
        }

        showToast(`Validation: ${errorDetails}`, 'error');
      } else {
        const formattedError = handleError(error, 'CreateFormulaire');
        showToast(`${MESSAGES.error.sauvegarde}: ${formattedError.userMessage}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }; return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
                  <h1 className="text-xl font-semibold text-gray-900">Nouveau formulaire</h1>
                  <p className="text-sm text-gray-800">Créez un nouveau formulaire et l'étude associée</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/formulaire')} className="px-4 py-2 text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Retour
                </button>
                <button onClick={() => sauvegarderFormulaire('BROUILLON')} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  <DocumentIcon className="w-4 h-4" />
                  {isLoading ? "Sauvegarde..." : "Sauvegarder le formulaire"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
          <ThemeSelector
            rechercheTheme={rechercheTheme}
            onRechercheChange={setRechercheTheme}
            onThemeSelect={ajouterTheme}
            champsCount={champs.length}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Informations Générales</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Etude *</label>
                <input type="text" value={titreEtude} onChange={(e) => setTitreEtude(e.target.value)} placeholder="Ex: Étude sur l'efficacité de la molécule X" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Description de l'étude</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez brièvement l'objectif de l'étude..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Questions ({champs.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                {historique.length > 0 && (
                  <button
                    onClick={annulerDernierAjout}
                    className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
                    title="Annuler le dernier ajout de thème"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Annuler
                  </button>
                )}
                {champs.length > 0 && (
                  <button
                    onClick={toutSupprimer}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                    title="Supprimer toutes les questions"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Tout supprimer
                  </button>
                )}
                <button onClick={() => setModeAjout(!modeAjout)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Ajouter une question
                </button>
              </div>
            </div>

            <QuestionTypeSelector
              isOpen={modeAjout}
              onClose={() => setModeAjout(false)}
              onSelectType={ajouterChamp}
            />

            <div className="space-y-4">
              {champs.map((champ, index) => {
                const isNew = nouveauxChampsIds.includes(champ.id);
                return (
                  <div
                    key={champ.id}
                    onClick={(e) => { e.stopPropagation(); setActiveChampId(champ.id); }}
                    className={`transition-all duration-500 ${isNew
                      ? 'opacity-0'
                      : 'opacity-100'
                      }`}
                    style={isNew ? {
                      animationName: 'slideIn',
                      animationDuration: '0.5s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards',
                      animationDelay: `${index * 0.05}s`
                    } : undefined}
                  >
                    <Question
                      champ={champ}
                      index={index}
                      onDelete={supprimerChamp}
                      onUpdate={modifierChamp}
                      isActive={champ.id === activeChampId}
                      existingVariables={champs.map(c => c.nomVariable).filter(Boolean)}
                      isDragging={draggedItemId === champ.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  </div>
                );
              })}
              {champs.length === 0 && (
                <div className="text-center py-12 text-gray-800">
                  <p>Aucune question pour le moment.</p>
                  <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer à construire votre formulaire.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmerSuppression}
        questionCount={champs.length}
      />
    </>
  );
}
