// Types d'études médicales disponibles dans l'application
export const TYPES_ETUDES = [
  { value: "Cardio-Vasculaire", label: "Cardio-Vasculaire" },
  { value: "Chirurgie", label: "Chirurgie" },
  { value: "Endocrinologie", label: "Endocrinologie" },
  { value: "Urgences", label: "Urgences" },
  { value: "Général", label: "Médecine Générale" },
  { value: "Pédiatrie", label: "Pédiatrie" },
  { value: "Oncologie", label: "Oncologie" },
  { value: "Neurologie", label: "Neurologie" },
  { value: "Orthopédie", label: "Orthopédie" },
  { value: "Dermatologie", label: "Dermatologie" }
] as const;

export type TypeEtude = typeof TYPES_ETUDES[number]['value'];