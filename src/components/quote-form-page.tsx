"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// Este es el componente principal que manejará el estado de todo el formulario.
export function QuoteFormPage() {
  // 1. Inicializamos el formulario con React Hook Form y Zod para la validación.
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customer: { id: "", name: "" },
      productLines: [],
      notes: "Validez de la oferta: 15 días.\nCondiciones de pago: 30 días.",
    },
    mode: "onBlur", // Las validaciones se ejecutarán cuando el usuario salga de un campo.
  });

  // 2. Definimos la función que se ejecutará al enviar el formulario.
  function onSubmit(values: QuoteFormValues) {
    // Por ahora, solo mostraremos los datos en la consola y una notificación.
    console.log("Datos del formulario:", values);
    toast.success("Cotización Generada", {
      description: "Los datos se han validado y enviado con éxito.",
    });
  }

  return (
    // 3. El FormProvider permite que los componentes hijos accedan al estado del formulario.
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección de Datos del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aquí irá el selector de clientes y sus datos.</p>
          </CardContent>
        </Card>

        {/* Sección de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Aquí irá la tabla para agregar y editar productos.</p>
          </CardContent>
        </Card>
        
        {/* Botón de envío */}
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Generar Cotización
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
