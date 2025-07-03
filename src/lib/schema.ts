import { z } from "zod";

// Define la estructura de una sola línea de producto en la cotización.
export const productLineSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto"),
  code: z.string(),
  equivalence: z.string(),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z.coerce.number(),
  total: z.coerce.number(),
});

// Define la estructura completa del formulario de cotización.
export const quoteFormSchema = z.object({
  customer: z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre del cliente es requerido"),
    priceList: z.string().optional(), // Añadido para la lógica de precios
  }),
  rut: z.string().optional(),
  phone: z.string().optional(),
  salesperson: z.string().optional(),
  productLines: z.array(productLineSchema).min(1, "Debe agregar al menos un producto."),
  notes: z.string().optional(),
});

// Exportamos los tipos inferidos de los esquemas para usarlos en nuestros componentes.
export type ProductLine = z.infer<typeof productLineSchema>;
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

