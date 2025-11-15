import { 
  LockClosedIcon, 
  BeakerIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Éléments décoratifs eco-friendly */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-emerald-300 rounded-full opacity-25"></div>
        
        <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10">
          {/* Logo/Icon médical eco-friendly */}
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <SparklesIcon className="w-12 h-12 text-emerald-600" />
              <HeartIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          {/* Titre principal */}
          <div className="text-center mb-12 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
              MedDataCollect
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 font-light">
              Plateforme éco-responsable de collecte de données médicales
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Révolutionnez vos études cliniques avec une approche durable et moderne. 
              Collectez, analysez et partagez vos données en toute sécurité.
            </p>
          </div>

          {/* Boutons d'action améliorés */}
          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            <a
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5" />
                Connexion
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>

            <a
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <ArrowRightIcon className="w-5 h-5" />
                Créer un compte
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>

          {/* Fonctionnalités clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sécurisé</h3>
              <p className="text-gray-600 text-sm">Données chiffrées et conformité RGPD garantie</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <GlobeAltIcon className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Éco-responsable</h3>
              <p className="text-gray-600 text-sm">Infrastructure verte et optimisée énergétiquement</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <BoltIcon className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Performant</h3>
              <p className="text-gray-600 text-sm">Interface rapide et intuitive pour tous</p>
            </div>
          </div>

          {/* Footer minimaliste */}
          <div className="mt-16 text-center text-gray-500 text-sm flex items-center justify-center gap-4">
            <span className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-4 h-4" />
              Conçu pour les professionnels de santé
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" />
              Respectueux de l&apos;environnement
            </span>
          </div>
        </div>
      </main>
  );
}
