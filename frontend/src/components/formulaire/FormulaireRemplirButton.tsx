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
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    try {
      const res = await createEnvoiPourChercheur(token, formulaireId);
      const newId = res?.id;
      if (newId) {
        router.push(`/formulaire/remplir?id=${newId}&source=chercheur`);
      } else {
        showToast('Impossible de créer l\'envoi', 'error');
      }
    } catch (err: any) {
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
