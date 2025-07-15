"use client";
import { useEffect, useState } from "react";

type Producto = {
  codigo: string;
  nombre: string;
  precio: number;
};

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
    // ... (esta parte no cambia)
    const obtenerDatos = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbxMgmv4c-Ex0LLmqwteYgXUl4UuC4wetDRvgnjvzEGy8N21k-AOK4xDBwao2VQVVCg9/exec"
        );
        const data = await res.json();
        const productosProcesados: Producto[] = data
          .map((item: any) => {
            const keys = Object.keys(item).reduce((acc: any, k: string) => {
              acc[k.toLowerCase().trim()] = k;
              return acc;
            }, {});
            const codigo = item[keys["código"]] || item[keys["codigo"]] || "";
            const nombre = item[keys["producto"]] || item[keys["nombre"]] || "";
            const precioKey = Object.keys(item).find((k) =>
              k.toLowerCase().includes(listaPrecio.toLowerCase())
            );
            const precioRaw = precioKey ? item[precioKey] : "0";
            const precio = parseFloat(
              (precioRaw || "0")
                .toString()
                .replace(/\$/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
            );
            return {
              codigo,
              nombre,
              precio: isNaN(precio) ? 0 : precio,
            };
          })
          .filter((p: Producto) => p.codigo && p.nombre);
        setProductos(productosProcesados);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    obtenerDatos();
  }, [listaPrecio]);

  // 👇 CAMBIO 1: La lista filtrada ahora depende de si 'busqueda' tiene texto.
  const productosFiltrados = busqueda
    ? productos.filter(
        (p) =>
          p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  // 👇 CAMBIO 2: Nueva función para manejar el clic.
  const handleSelectProducto = (producto: Producto) => {
    onProductoSeleccionado(producto); // Envía el producto al componente padre
    setBusqueda(""); // Limpia la búsqueda y cierra la lista
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

      {/* La lista solo aparece si hay productos filtrados */}
      {productosFiltrados.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {productosFiltrados.map((p) => (
            <li key={p.codigo} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => handleSelectProducto(p)} // Usamos la nueva función
                className="product-item-button"
              >
                {p.codigo} - {p.nombre} (${p.precio.toLocaleString()})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}