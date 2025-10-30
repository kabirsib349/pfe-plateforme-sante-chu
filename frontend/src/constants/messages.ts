// Messages standardisés pour l'application
export const MESSAGES = {
  // Messages de validation
  validation: {
    nomFormulaire: 'Veuillez saisir un nom pour le formulaire',
    nomCreateur: 'Veuillez saisir votre nom en tant que créateur du formulaire',
    champsVides: 'Veuillez remplir tous les champs obligatoires',
    formulaireVide: 'Le formulaire doit contenir au moins une question'
  },
  
  // Messages de succès
  success: {
    brouillonSauve: 'Formulaire sauvé en brouillon avec succès !',
    formulairePublie: 'Formulaire validé et publié avec succès !',
    formulaireSupprime: 'Formulaire supprimé avec succès',
    donneesExportees: 'Données exportées avec succès'
  },
  
  // Messages d'erreur
  error: {
    sauvegarde: 'Erreur lors de la sauvegarde du formulaire',
    chargement: 'Erreur lors du chargement des données',
    suppression: 'Erreur lors de la suppression du formulaire',
    reseau: 'Erreur de connexion. Veuillez réessayer.'
  },
  
  // Messages de confirmation
  confirmation: {
    supprimerFormulaire: 'Êtes-vous sûr de vouloir supprimer ce formulaire ?',
    quitterSansEnregistrer: 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?',
    publierFormulaire: 'Êtes-vous sûr de vouloir publier ce formulaire ? Il sera accessible aux investigateurs.'
  },
  
  // Messages informatifs
  info: {
    aucunFormulaire: 'Aucun formulaire trouvé. Créez votre premier formulaire pour commencer.',
    aucunResultat: 'Aucun formulaire ne correspond à vos critères de recherche.',
    chargementEnCours: 'Chargement en cours...',
    sauvegardeEnCours: 'Sauvegarde en cours...',
    premierFormulaire: 'Commencez par créer votre premier formulaire !',
    aucuneActivite: 'Aucune activité récente. Créez votre premier formulaire pour commencer !',
    statistiquesVides: 'Vos statistiques apparaîtront ici une fois que vous aurez créé des formulaires.'
  }
} as const;