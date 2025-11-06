'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
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

export default function NouveauFormulaire() {
  const router = useRouter();
  const { token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();
  const { triggerStatsRefresh } = useStatsRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [nomFormulaire, setNomFormulaire] = useState('');
  const [description, setDescription] = useState('');
  const [titreEtude, setTitreEtude] = useState('');
  const [champs, setChamps] = useState<ChampFormulaire[]>([]);
  const [modeAjout, setModeAjout] = useState(false);
  const [activeChampId, setActiveChampId] = useState<string | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
      const themesMedicaux = [
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
                {libelle: 'Masculin', valeur:'0'},
                {libelle: 'Féminin', valeur:'1'}
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
              formuleCalcul: 'POIDS/(TAILLE^2)',
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
          description: "Informations sur l'hospitalisation",
          icon: BuildingOffice2Icon,
          champs: [
            { 
              type: 'choix_unique' as TypeChamp, 
              question: 'Lieu avant le séjour à l\'hôpital', 
              nomVariable: 'PROVENANCE',
              obligatoire: true,
              options: [
                { libelle: 'DOMICILE', valeur: '1' },
                { libelle: 'AUTRE ETABLISSEMENT', valeur: '2' }
              ]
            },
            { 
              type: 'date' as TypeChamp, 
              question: 'Date d\'entrée à l\'hôpital', 
              nomVariable: 'DATE_ENTREE',
              obligatoire: true
            },
            { 
              type: 'choix_multiple' as TypeChamp, 
              question: 'Lieu après le séjour à l\'hôpital', 
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
              question: 'Consultation d\'anesthésie', 
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
              question: 'Type d\'anesthésie',
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
              question: 'Durée de l\'intervention', 
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
    const ajouterTheme = (theme: any) => {
      const nouveauxChamps = theme.champs.map((champ: any) => ({
        ...champ,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setChamps([...champs, ...nouveauxChamps]);
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
              return {
                label: champ.question,
                type: champ.type.toUpperCase(),
                obligatoire: champ.obligatoire,
                valeurMin: champ.valeurMin,
                valeurMax: champ.valeurMax,
                nomListeValeur: champ.type === 'choix_multiple' && champ.nomVariable ? `LISTE_${champ.nomVariable}` : undefined,
                options: champ.options, 
                unite: champ.unite,
              }
            }), 
          };
      
          try {
            const response = await fetch('http://localhost:8080/api/formulaires', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
      
            if (response.ok) {
              const message = 'Formulaire sauvegardé avec succès !';
              showToast(message, 'success');
              triggerStatsRefresh();
              setTimeout(() => {
                router.push('/formulaire');
              }, 1500); 
            } else {
              const errorData = await response.json().catch(() => ({ message: 'Réponse invalide du serveur' }));
              console.error('Erreur de l\'API:', errorData);
              showToast(`${MESSAGES.error.sauvegarde}: ${errorData.message || 'Erreur inconnue du serveur.'}`, 'error');
            }
          } catch (error) {
            console.error('Erreur réseau:', error);
            showToast(MESSAGES.error.reseau, 'error');
          } finally {
            setIsLoading(false);
          }
        };        return (
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Ajouter des thèmes médicaux</h2>
            </div>
            <p className="text-sm text-gray-800 mb-4">
              Cliquez sur les thèmes pour ajouter progressivement les questions à votre formulaire. 
              Chaque clic <strong>ajoute</strong> les questions du thème à celles déjà présentes.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {themesMedicaux.map((theme, index) => (
                <div key={index} 
                     className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer transform hover:scale-105"
                     onClick={() => ajouterTheme(theme)}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <theme.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{theme.nom}</h3>
                    <p className="text-xs text-gray-800 mb-2">{theme.description}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                      <PlusIcon className="w-3 h-3" />
                      <span>+{theme.champs.length} questions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {champs.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span><strong>{champs.length}</strong> question(s) ajoutée(s) au formulaire</span>
                </div>
              </div>
            )}
          </div>
  
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Informations Générales</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Nom du formulaire *</label>
                <input type="text" value={nomFormulaire} onChange={(e) => setNomFormulaire(e.target.value)} placeholder="Ex: Protocole de suivi post-opératoire" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Nom de l'étude associée *</label>
                <input type="text" value={titreEtude} onChange={(e) => setTitreEtude(e.target.value)} placeholder="Ex: Étude sur l'efficacité de la molécule X" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Description du formulaire</label>
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
                        <div className="text-xs text-gray-800">Réponse courte ou longue</div>
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
                        <div className="text-xs text-gray-800">Valeur numérique avec limites</div>
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
                        <div className="text-xs text-gray-800">Sélecteur de date</div>
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
                        <div className="text-xs text-gray-800">Liste d'options prédéfinies</div>
                    </button>
                    <button 
                      onClick={() => ajouterChamp('choix_unique')} 
                      className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Choix Unique</div>
                      </div>
                      <div className="text-xs text-gray-800">Boutons radio - un seul choix</div>
                    </button>
                    <button 
                      onClick={() => ajouterChamp('calcule')} 
                      className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <RocketLaunchIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="font-semibold text-gray-900">Champ Calculé</div>
                      </div>
                      <div className="text-xs text-gray-800">Calcul automatique (IMC, etc.)</div>
                    </button>
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setModeAjout(false)}
                    className="text-sm text-gray-800 hover:text-gray-700 transition-colors"
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
    );
  }
  