'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
import { getFormulaireById, updateFormulaire } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
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
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import Question, { ChampFormulaire, TypeChamp } from "@/src/components/form-builder/Question";
import { ToastContainer } from "@/src/components/ToastContainer";
import { MESSAGES } from "@/src/constants/messages";

interface FormulaireAPI {
  idFormulaire: number;
  titre: string;
  description: string;
  etude: {
    titre: string;
    description: string;
  };
  statut: string;
  champs: any[];
}

export default function ModifierFormulaire() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();
  const { triggerStatsRefresh } = useStatsRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [nomFormulaire, setNomFormulaire] = useState('');
  const [description, setDescription] = useState('');
  const [titreEtude, setTitreEtude] = useState('');
  const [champs, setChamps] = useState<ChampFormulaire[]>([]);
  const [modeAjout, setModeAjout] = useState(false);
  const [activeChampId, setActiveChampId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const formulaireId = params.id as string;

  useEffect(() => {
    const fetchFormulaire = async () => {
      if (!token || !formulaireId) return;

      try {
        const data: FormulaireAPI = await getFormulaireById(token, parseInt(formulaireId));
        setNomFormulaire(data.titre);
        setDescription(data.description || '');
        setTitreEtude(data.etude.titre);
        
        // Convertir les champs de l'API vers le format du composant
        const champsConverts: ChampFormulaire[] = data.champs.map((champ, index) => ({
          id: champ.idChamp?.toString() || index.toString(),
          type: champ.type.toLowerCase() as TypeChamp,
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
  }, [token, formulaireId, router, showToast]);

  const ajouterChamp = (type: TypeChamp) => {
    const nouveauChamp: ChampFormulaire = {
      id: `new-${Date.now().toString()}`,
      type,
      nomVariable: '',
      question: '',
      obligatoire: false,
      options: type === 'choix_multiple' ? [{ libelle: 'Oui', valeur: '1' }, { libelle: 'Non', valeur: '0' }] : undefined,
      unite: '', // Toujours initialiser comme une chaîne vide
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
    if (!nomFormulaire.trim()) {
      showToast(MESSAGES.validation.nomFormulaire, 'error');
      return;
    }
    if (!titreEtude.trim()) {
      showToast("Veuillez saisir un nom pour l'étude.", 'error');
      return;
    }
    if (!token) {
      showToast('Authentification requise. Veuillez vous reconnecter.', 'error');
      return;
    }

    setIsLoading(true);

    const payload = {
      titre: nomFormulaire,
      description: description,
      statut: statut,
      titreEtude: titreEtude,
      descriptionEtude: `Étude concernant le formulaire : ${nomFormulaire}`,
      champs: champs.map(champ => ({
        id: champ.id.startsWith('new-') ? null : champ.id, // Envoyer null pour les nouveaux champs
        label: champ.question,
        type: champ.type.toUpperCase(),
        obligatoire: champ.obligatoire,
        valeurMin: champ.valeurMin,
        valeurMax: champ.valeurMax,
        unite: champ.unite || '',
        nomListeValeur: champ.type === 'choix_multiple' ? `LISTE_${champ.nomVariable || champ.id}` : undefined,
        options: champ.options,
      })),
    };

    try {
      await updateFormulaire(token!, parseInt(formulaireId), payload);
      
      const message = statut === 'BROUILLON'
        ? 'Formulaire modifié et sauvegardé comme brouillon !'
        : 'Formulaire modifié et publié avec succès !';
      showToast(message, 'success');
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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Modifier le formulaire</h1>
                <p className="text-sm text-gray-600">Modifiez votre formulaire et l'étude associée</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/formulaire')} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Retour
              </button>
              <button onClick={() => sauvegarderFormulaire('BROUILLON')} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                <DocumentIcon className="w-4 h-4" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Informations Générales</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du formulaire *</label>
              <input type="text" value={nomFormulaire} onChange={(e) => setNomFormulaire(e.target.value)} placeholder="Ex: Protocole de suivi post-opératoire" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'étude associée *</label>
              <input type="text" value={titreEtude} onChange={(e) => setTitreEtude(e.target.value)} placeholder="Ex: Étude sur l'efficacité de la molécule X" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description du formulaire</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez brièvement l'objectif de ce formulaire..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Questions ({champs.length})</h2>
            </div>
            <button onClick={() => setModeAjout(!modeAjout)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Ajouter une question
            </button>
          </div>

          {modeAjout && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-lg">✨</span>
                Choisissez le type de question :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => ajouterChamp('texte')} 
                    className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                  >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Texte</div>
                      </div>
                      <div className="text-xs text-gray-600">Réponse courte ou longue</div>
                  </button>
                  <button 
                    onClick={() => ajouterChamp('nombre')} 
                    className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                  >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <HashtagIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Nombre</div>
                      </div>
                      <div className="text-xs text-gray-600">Valeur numérique avec limites</div>
                  </button>
                  <button 
                    onClick={() => ajouterChamp('date')} 
                    className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                  >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Date</div>
                      </div>
                      <div className="text-xs text-gray-600">Sélecteur de date</div>
                  </button>
                  <button 
                    onClick={() => ajouterChamp('choix_multiple')} 
                    className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                  >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <CheckCircleIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Choix Multiple</div>
                      </div>
                      <div className="text-xs text-gray-600">Liste d'options prédéfinies</div>
                  </button>
              </div>
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setModeAjout(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {champs.map((champ, index) => (
              <div key={champ.id} onClick={(e) => { e.stopPropagation(); setActiveChampId(champ.id); }}>
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
            ))}
            {champs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Aucune question pour le moment.</p>
                <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer à construire votre formulaire.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}