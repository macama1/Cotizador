"use client";
import { useRef, useState, useEffect } from "react";
import SelectCliente from "../Components/SelectCliente";
import SelectProducto from "../Components/SelectProducto";
import PDFCotizacion from "../Components/PDFCotizacion";
import html2pdf from "html2pdf.js";

// --- TIPOS DE DATOS ---
type Vendedor = { Vendedor: string; Correo: string; Número: string; };
type Cliente = { ID: string; Cliente: string; Vendedor: string; Direccion?: string; Correo?: string; Telefono?: string; "Lista Precio": string; };
type Producto = { codigo: string; nombre: string; precio: number; cantidad?: number; };

// --- URLs DE TUS APIS ---
const API_URL_VENDEDORES = "https://script.google.com/macros/s/AKfycbyaIishpFMYgfcQLjm1EA_hz-Hru0mNJP9TyoUfRYs7UZMfXIOKaegzgZLJrCZQOHt9/exec";
const API_URL_CONTADOR = "https://script.google.com/macros/s/AKfycbwFpI9usyyZ6LmRiEXfqZ_fYetk1M8HEbx_a7X8xl7Hnv5SX8OYdWWv6Kwb30XHkhtp/exec";
// Pega aquí la URL de tu script para REGISTRAR en la hoja de cálculo
const API_URL_REGISTRO = "https://script.google.com/macros/s/AKfycbwWqKamhL6S8XP6BC3r0v-zo047tJEKk4XJE5KmmlwstGZy_93GI6ryhxyrJRy3tdRQ/exec";

export default function Home() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [vendedorAsociado, setVendedorAsociado] = useState<Vendedor | null>(null);
  const [numeroCotizacion, setNumeroCotizacion] = useState<number | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API_URL_VENDEDORES).then(res => res.json()).then(data => { if (Array.isArray(data)) setVendedores(data); }).catch(console.error);
    fetch(API_URL_CONTADOR).then(res => res.json()).then(data => { if (data && typeof data.numero === 'number') setNumeroCotizacion(data.numero + 1); }).catch(console.error);
  }, []);

  useEffect(() => {
    if (cliente && vendedores.length > 0) {
      const nombreVendedorCliente = cliente.Vendedor.trim().toLowerCase();
      const vendedorEncontrado = vendedores.find(v => v.Vendedor.trim().toLowerCase() === nombreVendedorCliente);
      setVendedorAsociado(vendedorEncontrado || null);
    } else {
      setVendedorAsociado(null);
    }
  }, [cliente, vendedores]);

  const handleChangeCliente = (campo: keyof Cliente, valor: string) => {
    if (cliente) setCliente({ ...cliente, [campo]: valor });
  };
  
  const agregarProducto = (producto: Producto) => setProductos(prev => [...prev, { ...producto, cantidad: 1 }]);
  const actualizarCantidad = (index: number, cantidad: number) => {
    setProductos(prev => prev.map((p, i) => i === index ? { ...p, cantidad: isNaN(cantidad) ? 1 : cantidad } : p));
  };
  const eliminarProducto = (index: number) => {
    setProductos(prev => prev.filter((_, i) => i !== index));
  };
  const actualizarPrecio = (index: number, precio: number) => {
    setProductos(prev => prev.map((p, i) => i === index ? { ...p, precio: isNaN(precio) ? 0 : precio } : p));
  };

  const subtotal = productos.reduce((acc, p) => acc + (p.precio || 0) * (p.cantidad || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const totalAPagar = subtotal + iva;

  const generarPDF = () => {
    if (!pdfRef.current || !cliente || numeroCotizacion === null) {
      return alert("Por favor, seleccione un cliente y espere...");
    }

    const element = pdfRef.current;
    const fileName = `cotizacion_${cliente.Cliente}_${numeroCotizacion}.pdf`;
    const opciones = { margin: 0, filename: fileName, image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' } };

    html2pdf().from(element).set(opciones).save()
      .then(() => {
        // --- LÓGICA DE REGISTRO AÑADIDA AQUÍ ---
        const productosAgrupados = productos.map(p => `${p.cantidad || 1} ${p.codigo}`).join(', ');
        const preciosAgrupados = productos.map(p => `$${p.precio.toLocaleString('es-CL')}`).join(', ');

        const registroData = {
          numeroCotizacion: numeroCotizacion,
          fecha: new Date().toLocaleDateString('es-CL'),
          cliente: cliente.Cliente,
          rut: cliente.ID,
          vendedor: vendedorAsociado?.Vendedor || cliente.Vendedor,
          productosAgrupados: productosAgrupados,
          preciosAgrupados: preciosAgrupados,
          subtotal: subtotal
        };
        
        // Envía los datos a la hoja de cálculo
        fetch(API_URL_REGISTRO, {
          method: 'POST',
          body: JSON.stringify(registroData),
          // Se agrega mode: 'no-cors' para evitar errores de CORS con Apps Script
          // cuando no necesitas leer la respuesta.
          mode: 'no-cors',
        }).then(() => console.log("Se envió la solicitud de registro a Google Sheets."))
          .catch(error => console.error("Error al registrar cotización:", error));
        // --- FIN DE LA LÓGICA DE REGISTRO ---

        // Incrementa el contador para la próxima cotización
        fetch(API_URL_CONTADOR, { method: 'POST' });
        setNumeroCotizacion(prev => prev ? prev + 1 : 1);
      });
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Cotizador Natstone</h1>
      <SelectCliente onClienteSeleccionado={setCliente} />

      {cliente && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Datos del Cliente</h2>
          <p><strong>ID:</strong> {cliente.ID}</p>
          <p><strong>Nombre:</strong> {cliente.Cliente}</p>
          <div className="client-details-form">
            <label>Vendedor (Asociado):</label>
            <input type="text" value={vendedorAsociado?.Vendedor || cliente.Vendedor} readOnly />
            <label>Dirección:</label>
            <input type="text" value={cliente.Direccion || ""} onChange={(e) => handleChangeCliente("Direccion", e.target.value)} />
            <label>Correo (Cliente):</label>
            <input type="email" value={cliente.Correo || ""} onChange={(e) => handleChangeCliente("Correo", e.target.value)} />
            <label>Teléfono (Cliente):</label>
            <input type="text" value={cliente.Telefono || ""} onChange={(e) => handleChangeCliente("Telefono", e.target.value)} />
          </div>

          <h3 style={{ marginTop: "2rem" }}>Agregar Producto</h3>
          <SelectProducto listaPrecio={cliente["Lista Precio"]} onProductoSeleccionado={agregarProducto} />
          
          {productos.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3>Productos Seleccionados</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="table-header">Código</th>
                    <th className="table-header">Producto</th>
                    <th className="table-header">Precio</th>
                    <th className="table-header">Cantidad</th>
                    <th className="table-header">Subtotal</th>
                    <th className="table-header">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => (
                    <tr key={p.codigo || i}>
                      <td className="table-cell">{p.codigo}</td>
                      <td className="table-cell">{p.nombre}</td>
                      <td className="table-cell"><input type="number" min={0} value={p.precio} className="price-input" onChange={(e) => actualizarPrecio(i, parseFloat(e.target.value))} /></td>
                      <td className="table-cell"><input type="number" min={1} value={p.cantidad} className="quantity-input" onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value))} /></td>
                      <td className="table-cell">${(p.precio * (p.cantidad || 0)).toLocaleString("es-CL")}</td>
                      <td className="table-cell" style={{ textAlign: "center" }}><button onClick={() => eliminarProducto(i)} style={{ color: "red", background: 'none', border: 'none' }}>❌</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '2rem', textAlign: 'right', maxWidth: '350px', marginLeft: 'auto', fontSize: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Subtotal:</span><span>${subtotal.toLocaleString('es-CL')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA (19%):</span><span>${iva.toLocaleString('es-CL')}</span></div>
                <hr style={{ border: 'none', borderTop: '1px solid #555', margin: '1rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}><span>Total a Pagar:</span><span>${totalAPagar.toLocaleString('es-CL')}</span></div>
              </div>
            </div>
          )}
          
          <button
            onClick={generarPDF}
            disabled={numeroCotizacion === null}
            className="pdf-button"
          >
            {numeroCotizacion === null ? 'Cargando...' : `📄 Descargar y Registrar PDF No. ${numeroCotizacion}`}
          </button>
        </div>
      )}

      <div style={{ position: 'absolute', zIndex: -1, top: '-9999px', left: '-9999px', opacity: 0 }}>
        {cliente && (
          <div ref={pdfRef}>
            <PDFCotizacion
              cliente={cliente}
              vendedor={vendedorAsociado}
              productos={productos}
              numero={numeroCotizacion || 0}
            />
          </div>
        )}
      </div>
    </main>
  );
}