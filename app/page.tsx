// app/page.tsx
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const navigateToTest = () => {
    router.push('/test');
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex flex-col">
      {/* Hero Section - Centrado vertical y horizontalmente */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Via Propósito
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10">
            Descubre tu perfil personal a través de nuestro test de evaluación
          </p>
          <button
            onClick={navigateToTest}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse"
          >
            Realizar el Test
          </button>
        </div>
      </main>

      {/* Footer sencillo */}
      <footer className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Via Propósito. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}