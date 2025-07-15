"use client";
import { useEffect, useState } from "react";
import { useCombobox } from "downshift";

// 👇 1. Se importa el tipo Cliente desde el archivo central
import { Cliente } from '../types.d'; 

// 2. La definición de tipo local 'type Cliente = { ... }' se elimina de aquí.

export default function SelectCliente({
  onClienteSeleccionado,
}: {
  onClienteSeleccionado: (cliente: Cliente | null) => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // El resto del código no necesita cambios, ya que usa la API correcta y
  // el componente downshift para la búsqueda.
  
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbxWhEhKc5IVk1o0szx9iljzeLLHmf60CFIxDNrgDxpSGVMil5XRZUiBCXok1v9Mzqn-/exec"
        );
        const data = await res.json();
        const clientesValidos = Array.isArray(data)
          ? data.filter((c: Cliente) => typeof c?.Cliente === "string")
          : [];
        setClientes(clientesValidos);
        setFilteredClientes(clientesValidos);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: filteredClientes,
    itemToString: (item) => (item ? item.Cliente : ""),
    onInputValueChange({ inputValue }) {
      const filtered = clientes.filter((cliente) =>
        cliente?.Cliente?.toLowerCase().includes(
          inputValue?.toLowerCase() || ""
        )
      );
      setFilteredClientes(filtered);
    },
    onSelectedItemChange({ selectedItem }) {
      onClienteSeleccionado(selectedItem || null);
    },
  });

  return (
    <div>
      <label>Seleccionar Cliente:</label>
      <input
        {...getInputProps()}
        className="combobox-input"
        placeholder="Buscar cliente..."
      />
      <ul {...getMenuProps()} className="combobox-menu">
        {isOpen &&
          filteredClientes.map((item, index) => (
            <li
              key={item.ID || index}
              {...getItemProps({ item, index })}
              className="combobox-item"
              style={{
                backgroundColor:
                  highlightedIndex === index ? "#bde4ff" : undefined,
              }}
            >
              {item.Cliente}
            </li>
          ))}
      </ul>
    </div>
  );
}