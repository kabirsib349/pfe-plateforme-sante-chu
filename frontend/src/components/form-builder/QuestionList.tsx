import {
    QuestionMarkCircleIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon // Using TrashIcon instead of generic svg if available, but staying consistent with original code
} from "@heroicons/react/24/outline";
import Question, { ChampFormulaire } from "@/src/components/form-builder/Question"; // Assuming legacy import
import { QuestionTypeSelector } from "@/src/components/formulaire/QuestionTypeSelector";

interface QuestionListProps {
    champs: any[]; // Using any to match temp hook types
    activeChampId: string | null;
    setActiveChampId: (id: string | null) => void;
    nouveauxChampsIds: string[];
    historiqueLength: number;
    onUndo: () => void;
    onDeleteAll: () => void;
    modeAjout: boolean;
    setModeAjout: (val: boolean) => void;
    handleAjouterChamp: (type: any) => void;
    supprimerChamp: (id: string) => void;
    modifierChamp: (id: string, val: any) => void;
    draggedItemId: string | null;
    handleDragStart: (id: string) => void;
    handleDragEnd: () => void;
    handleDrop: (id: string) => void;
}

export const QuestionList = ({
    champs,
    activeChampId,
    setActiveChampId,
    nouveauxChampsIds,
    historiqueLength,
    onUndo,
    onDeleteAll,
    modeAjout,
    setModeAjout,
    handleAjouterChamp,
    supprimerChamp,
    modifierChamp,
    draggedItemId,
    handleDragStart,
    handleDragEnd,
    handleDrop
}: QuestionListProps) => {

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Questions ({champs.length})</h2>
                </div>
                <div className="flex items-center gap-2">
                    {historiqueLength > 0 && (
                        <button
                            onClick={onUndo}
                            className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
                            title="Annuler le dernier ajout"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Annuler
                        </button>
                    )}
                    {champs.length > 0 && (
                        <button
                            onClick={onDeleteAll}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                            title="Supprimer toutes les questions"
                        >
                            <TrashIcon className="w-4 h-4" />
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
                onSelectType={handleAjouterChamp}
            />

            <div className="space-y-4">
                {champs.map((champ: any, index: number) => {
                    const isNew = nouveauxChampsIds.includes(champ.id);
                    return (
                        <div
                            key={champ.id}
                            onClick={(e) => { e.stopPropagation(); setActiveChampId(champ.id); }}
                            className={`transition-all duration-500 ${isNew ? 'opacity-0' : 'opacity-100'}`}
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
                                existingVariables={champs.map((c: any) => c.nomVariable).filter(Boolean)}
                                isDragging={draggedItemId === champ.id}
                                onDragStart={(e) => handleDragStart(champ.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={onDragOver}
                                onDrop={(e, targetId) => { e.preventDefault(); handleDrop(targetId); }}
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
    );
};
