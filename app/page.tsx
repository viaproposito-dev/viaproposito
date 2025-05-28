"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  const navigateToTest = () => {
    router.push('/test');
  };

  return (
    <div className="bg-[#295244] min-h-screen flex flex-col">
      {/* Hero Section - Centrado vertical y horizontalmente */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">

          {/* Logo completo */}
          <div>
            <Image
              src="/logos/logo_FFFBEF.png"
              alt="Vía Propósito"
              width={700}
              height={350}
              className="mx-auto"
              priority
            />
          </div>

          {/* Subtítulo */}
          <p className="text-[#FFFBEF]/90 text-xl lg:text-2xl mb-14 font-poppins font-normal leading-relaxed mx-auto">
            Descubre tu perfil personal a través de nuestro test de evaluación
          </p>

          {/* Botón CTA */}
          <button
            onClick={navigateToTest}
            className="px-12 py-6 bg-[#FFFBEF] text-[#295244] font-poppins font-semibold rounded-lg text-2xl md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:bg-[#FFFBEF]/90"
          >
            Realizar el Test
          </button>

        </div>
      </main>
    </div>
  );
}