"use client";
import { useEffect, useState } from "react";
import { Producto } from '../types.d';

type Props = {
  listaPrecio: string;
  onProductoSeleccionado: (producto: Producto) => void;
};

export default function SelectProducto({
  listaPrecio,
  onProductoSeleccionado,
}: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    // Si no hay una lista de precios del cliente, no hacemos nada.
    if (!listaPrecio) {
      setProductos([]);
      return; 
    }

    const obtenerDatos = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbxMgmv4c-Ex0LLmqwteYgXUl4UuC4wetDRvgnjvzEGy8N21k-AOK4xDBwao2VQVVCg9/exec" // URL de tu API de Productos
        );
        const data = await res.json();
        
        const productosProcesados: Producto[] = data
          .map((item: any): Producto | null => {
            // Mapeador para normalizar los nombres de las columnas
            const keys = Object.keys(item).reduce((acc: any, k: string) => {
              acc[k.toLowerCase().trim()] = k;
              return acc;
            }, {});

            const codigo = item[keys["código"]] || item[keys["codigo"]];
            const nombre = item[keys["producto"]] || item[keys["nombre"]];

            if (!codigo || !nombre) return null; // Si no tiene código o nombre, no es un producto válido

            // --- LÓGICA CORREGIDA ---
            // 1. Siempre busca el precio de la columna "lista precio base"
            const precioBaseKey = Object.keys(item).find(k => k.toLowerCase().trim() === "lista precio base");
            const precioBaseRaw = precioBaseKey ? item[precioBaseKey] : "0";
            const precioBase = parseFloat((String(precioBaseRaw) || "0").replace(/[$.]/g, "").replace(",", "."));

            // 2. Busca el precio específico para la lista del cliente
            const precioClienteKey = Object.keys(item).find(k => k.toLowerCase().includes(listaPrecio.toLowerCase()));
            // Si no encuentra un precio para el cliente, usa el precio base como predeterminado
            const precioClienteRaw = precioClienteKey ? item[precioClienteKey] : precioBaseRaw; 
            const precioCliente = parseFloat((String(precioClienteRaw) || "0").replace(/[$.]/g, "").replace(",", "."));

            return {
              codigo,
              nombre,
              precio: isNaN(precioCliente) ? 0 : precioCliente,
              precioBase: isNaN(precioBase) ? 0 : precioBase, // Se añade el precio base al objeto
            };
          })
          .filter((p: Producto | null): p is Producto => p !== null);
          
        setProductos(productosProcesados);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    
    obtenerDatos();
  }, [listaPrecio]);

  const productosFiltrados = busqueda
    ? productos.filter(
        (p) =>
          p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  const handleSelectProducto = (producto: Producto) => {
    onProductoSeleccionado(producto);
    setBusqueda(""); 
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar producto por código o nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="combobox-input"
        style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
      />

      {productosFiltrados.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {productosFiltrados.map((p) => (
            <li key={p.codigo} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => handleSelectProducto(p)}
                className="product-item-button"
              >
                {p.codigo} - {p.nombre} (${p.precio.toLocaleString('es-CL')})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
