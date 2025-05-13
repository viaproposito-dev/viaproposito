// app/page.tsx
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Via Proposito</h1>
        <div className="w-16 h-1 bg-gray-800 mx-auto mb-6"></div>
        <p className="text-2xl text-gray-600 mb-8">Página en construcción</p>
        <div className="flex justify-center space-x-4">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-500">© 2025 Via Proposito. Todos los derechos reservados.</p>
    </div>
  );
}