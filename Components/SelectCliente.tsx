"use client";
import { useEffect, useState } from "react";
import { useCombobox } from "downshift";
import { Cliente } from '../types.d'; 

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
          ? data.filter((c: Cliente) => typeof c?.Cliente === "string")
          : [];
        setClientes(clientesValidos);
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
    selectItem,
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
    <div style={{position: 'relative'}}>
      <label>Seleccionar Cliente:</label>
      {/* 👇 SE ELIMINA EL DIV FLEX Y EL BOTÓN DE LA FLECHA 👇 */}
      <input
        {...getInputProps()}
        className="combobox-input"
        placeholder="Buscar cliente..."
      />
      
      <ul {...getMenuProps()} className="combobox-menu">
        {isOpen &&
          filteredClientes.map((item, index) => (
            <li key={item.ID || index} style={{listStyle: 'none'}}>
              <button
                {...getItemProps({ item, index })}
                type="button" // Se añade type="button" para evitar envíos de formulario
                className="product-item-button"
                style={{
                  backgroundColor:
                    highlightedIndex === index ? '#3c3c3c' : undefined,
                  borderColor:
                    highlightedIndex === index ? 'var(--primary)' : undefined,
                }}
                onClick={() => selectItem(item)}
              >
                {item.Cliente}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
