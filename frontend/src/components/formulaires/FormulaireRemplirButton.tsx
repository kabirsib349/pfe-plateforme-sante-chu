"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/src/hooks/useAuth';
import { useToast } from '@/src/hooks/useToast';
import { createEnvoiPourChercheur } from '@/src/lib/api';

interface Props {
  formulaireId: number;
}

export function FormulaireRemplirButton({ formulaireId }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    console.debug('FormulaireRemplirButton clicked for', formulaireId);
    if (!token) {
      showToast('Authentification requise', 'error');
      return;
    }
    // immediate feedback
    showToast('Initialisation...', 'info');
    setIsLoading(true);
    try {
      console.debug('Calling createEnvoiPourChercheur', { formulaireId });
      try { window?.alert && window.alert('Démarrage création envoi...'); } catch (_) {}
      const res = await createEnvoiPourChercheur(token, formulaireId);
      console.debug('createEnvoiPourChercheur response', res);
      try { window?.alert && window.alert('Réponse API reçue'); } catch (_) {}
      const newId = res?.id;
      if (newId) {
        showToast('Envoi préparé — ouverture du formulaire', 'success');
        try { window?.alert && window.alert('Redirection vers formulaire: ' + newId); } catch (_) {}
        router.push(`/formulaire/remplir?id=${newId}&source=chercheur`);
      } else {
        showToast('Impossible de créer l\'envoi', 'error');
        try { window?.alert && window.alert('Impossible de créer l\'envoi (pas d\'id retourné)'); } catch (_) {}
      }
    } catch (err: any) {
      console.error('Erreur createEnvoi:', err);
      try { window?.alert && window.alert('Erreur lors de la création: ' + (err?.message || String(err))); } catch (_) {}
      showToast(err?.message || 'Erreur lors de la création de l\'envoi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackHref = `/formulaire/remplir?id=${formulaireId}&source=chercheur`;

  return (
    <a
      href={fallbackHref}
      role="button"
      onClick={async (e) => {
        // Si JS est activé, on empêche la navigation et on exécute l'appel API
        e.preventDefault();
        if (!isLoading) await handleClick(e as any);
      }}
      onPointerDown={(e) => { /* prevent parent accordion toggle */ e.stopPropagation(); }}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${isLoading ? 'opacity-70 cursor-wait' : 'bg-green-600 hover:bg-green-700 text-white'}`}
    >
      <ClipboardDocumentListIcon className="w-4 h-4" />
      {isLoading ? 'Création...' : 'Remplir'}
    </a>
  );
}
