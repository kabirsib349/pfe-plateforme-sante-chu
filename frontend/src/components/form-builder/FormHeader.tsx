import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

interface FormHeaderProps {
    titreEtude: string;
    setTitreEtude: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
}

export const FormHeader = ({ titreEtude, setTitreEtude, description, setDescription }: FormHeaderProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Informations Générales</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Etude *</label>
                    <input
                        type="text"
                        value={titreEtude}
                        onChange={(e) => setTitreEtude(e.target.value)}
                        placeholder="Ex: Étude sur l'efficacité de la molécule X"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Description de l'étude</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez brièvement l'objectif de l'étude..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};
