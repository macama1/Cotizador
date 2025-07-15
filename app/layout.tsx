import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// 1. Cambia esto:
export const metadata: Metadata = {
  title: 'Cotizador Natstone',
  description: 'Aplicación para generar cotizaciones de productos Natstone.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Asegúrate que esta línea esté limpia, sin estilos adicionales.
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}