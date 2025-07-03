// src/app/page.tsx
import { FileText } from 'lucide-react';
import { QuoteFormPage } from '@/components/quote-form-page'; // Importamos nuestro nuevo componente

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Cotizador NatStone
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Reemplazamos el texto de bienvenida con nuestro componente de formulario */}
        <QuoteFormPage />
      </main>
    </div>
  );
}
