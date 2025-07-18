// En types.d.ts
export type Vendedor = {
    Vendedor: string;
    Correo: string;
    Número: string;
  };
  
  export type Cliente = {
    ID: string;
    Cliente: string;
    Vendedor: string;
    Direccion?: string;
    Correo?: string;
    Telefono?: string;
    "Lista Precio": string;
  };
  
  export type Producto = {
    codigo: string;
    nombre: string;
    precio: number;
    cantidad?: number; // La cantidad es opcional
    precioBase?: number; // El precio original
  };
