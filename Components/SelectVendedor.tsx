"use client";
import { useState, useEffect } from 'react';

// Es buena práctica tener este tipo en un archivo central (ej: app/types.ts)
type Vendedor = {
  Vendedor: string;
  Correo: string;
  Numero: string;
};

type Props = {
  onVendedorSeleccionado: (vendedor: Vendedor | null) => void;
};

export default function SelectVendedor({ onVendedorSeleccionado }: Props) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const VENDEDORES_API_URL = "https://script.google.com/macros/s/AKfycbyaIishpFMYgfcQLjm1EA_hz-Hru0mNJP9TyoUfRYs7UZMfXIOKaegzgZLJrCZQOHt9/exec";
        const res = await fetch(VENDEDORES_API_URL);
        const data = await res.json();
        if (Array.isArray(data)) {
          setVendedores(data);
        }
      } catch (err) {
        console.error("No se pudo cargar la lista de vendedores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendedores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombreVendedor = e.target.value;
    const vendedorSeleccionado = vendedores.find(v => v.Vendedor === nombreVendedor) || null;
    onVendedorSeleccionado(vendedorSeleccionado);
  };

  if (loading) {
    return <select disabled className="combobox-input"><option>Cargando vendedores...</option></select>;
  }

  return (
    <select onChange={handleChange} defaultValue="" className="combobox-input">
      <option value="" disabled>Seleccione un vendedor</option>
      {vendedores.map((vendedor) => (
        <option key={vendedor.Vendedor} value={vendedor.Vendedor}>
          {vendedor.Vendedor}
        </option>
      ))}
    </select>
  );
}