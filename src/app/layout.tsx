// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner'; // Importa el Toaster de sonner

export const metadata: Metadata = {
  title: 'Cotizador NatStone',
  description: 'Un cotizador web para NatStone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
