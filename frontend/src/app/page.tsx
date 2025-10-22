export default function Home() {
  return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6">
          Bienvenue sur MedDataCollect
        </h1>

        <div className="space-x-4">
          <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Connexion
          </a>

          <a
              href="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            Créer un compte
          </a>
        </div>
      </main>
  );
}
