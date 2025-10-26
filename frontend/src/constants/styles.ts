// Styles de boutons standardisés pour l'application
export const BUTTON_STYLES = {
  // Boutons principaux
  primary: "bg-blue-600 hover:bg-blue-700 text-white transition-colors",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white transition-colors",
  success: "bg-green-600 hover:bg-green-700 text-white transition-colors",
  warning: "bg-amber-600 hover:bg-amber-700 text-white transition-colors",
  danger: "bg-red-600 hover:bg-red-700 text-white transition-colors",
  
  // Tailles
  sm: "px-3 py-1 rounded text-xs",
  md: "px-4 py-2 rounded-lg text-sm",
  lg: "px-6 py-3 rounded-lg text-base",
  
  // Boutons d'action dans les cartes
  cardAction: "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 cursor-pointer transition-all duration-200",
  
  // États spéciaux
  disabled: "opacity-50 cursor-not-allowed",
  loading: "opacity-75 cursor-wait"
} as const;

// Couleurs pour les badges de statut
export const STATUS_COLORS = {
  validé: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "En attente": "bg-amber-50 text-amber-700 border border-amber-200",
  Brouillon: "bg-slate-50 text-slate-700 border border-slate-200",
  Archivé: "bg-gray-50 text-gray-700 border border-gray-200"
} as const;

// Couleurs pour les types d'études
export const ETUDE_COLORS = {
  "Cardio-Vasculaire": "bg-rose-50 text-rose-700 border border-rose-200",
  "Chirurgie": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "Endocrinologie": "bg-cyan-50 text-cyan-700 border border-cyan-200",
  "Urgences": "bg-orange-50 text-orange-700 border border-orange-200",
  "Général": "bg-blue-50 text-blue-700 border border-blue-200",
  "Pédiatrie": "bg-pink-50 text-pink-700 border border-pink-200",
  "Oncologie": "bg-purple-50 text-purple-700 border border-purple-200",
  "Neurologie": "bg-teal-50 text-teal-700 border border-teal-200",
  "Orthopédie": "bg-lime-50 text-lime-700 border border-lime-200",
  "Dermatologie": "bg-yellow-50 text-yellow-700 border border-yellow-200"
} as const;