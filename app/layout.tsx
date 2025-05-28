import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vía Propósito - Test de evaluación personal',
  description: 'Descubre tu perfil personal a través de nuestro test de evaluación',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=STIX+Two+Text:ital,wght@1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-poppins">{children}</body>
    </html>
  );
}