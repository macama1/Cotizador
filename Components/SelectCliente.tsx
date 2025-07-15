"use client";
import { useEffect, useState } from "react";
import { useCombobox } from "downshift";

// Para mejorar la robustez, este tipo debería venir de un archivo central como app/types.ts
type Cliente = {
  ID: string;
  Cliente: string;
};

export default function SelectCliente({
  onClienteSeleccionado,
}: {
  onClienteSeleccionado: (cliente: Cliente | null) => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbxWhEhKc5IVk1o0szx9iljzeLLHmf60CFIxDNrgDxpSGVMil5XRZUiBCXok1v9Mzqn-/exec"
        );
        const data = await res.json();
        const clientesValidos = Array.isArray(data)
          ? data.filter((c) => typeof c?.Cliente === "string")
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
      if (selectedItem) {
        onClienteSeleccionado(selectedItem);
      }
    },
  });

  return (
    <div>
      <label>Seleccionar Cliente:</label>
      <input
        {...getInputProps()}
        className="combobox-input" // <-- AÑADE ESTA CLASE
        placeholder="Buscar cliente..."
        style={{
          padding: "0.5rem",
          width: "100%",
          border: "1px solid #ccc",
          marginBottom: "0.5rem",
        }}
      />
      <ul
        {...getMenuProps()}
        style={{
          border: "1px solid #ccc",
          maxHeight: 200,
          overflowY: "auto",
          padding: 0,
          margin: 0,
          listStyle: "none",
        }}
      >
        {isOpen &&
          filteredClientes.map((item, index) => (
            <li
              key={item.ID || index}
              {...getItemProps({ item, index })}
              style={{
                backgroundColor:
                  highlightedIndex === index ? "#bde4ff" : "#2c2c2c",
                color: highlightedIndex === index ? "#111" : "#f1f1f1",
                padding: "0.5rem",
                cursor: "pointer",
              }}
            >
              {item.Cliente}
            </li>
          ))}
      </ul>
    </div>
  );
}