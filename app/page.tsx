"use client";
import { useRef, useState, useEffect } from "react";
import Image from 'next/image';
import SelectCliente from "../Components/SelectCliente";
import SelectProducto from "../Components/SelectProducto";
import PDFCotizacion from "../Components/PDFCotizacion";
import { Vendedor, Cliente, Producto } from '../types.d'; 

// URLs DE TUS APIS
const API_URL_VENDEDORES = "https://script.google.com/macros/s/AKfycbyaIishpFMYgfcQLjm1EA_hz-Hru0mNJP9TyoUfRYs7UZMfXIOKaegzgZLJrCZQOHt9/exec";
const API_URL_CONTADOR = "https://script.google.com/macros/s/AKfycbwFpI9usyyZ6LmRiEXfqZ_fYetk1M8HEbx_a7X8xl7Hnv5SX8OYdWWv6Kwb30XHkhtp/exec";
const API_URL_REGISTRO = "https://script.google.com/macros/s/AKfycbwWqKamhL6S8XP6BC3r0v-zo047tJEKk4XJE5KmmlwstGZy_93GI6ryhxyrJRy3tdRQ/exec";

export default function Home() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [vendedorAsociado, setVendedorAsociado] = useState<Vendedor | null>(null);
  const [numeroCotizacion, setNumeroCotizacion] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para los nuevos campos
  const [formaDePago, setFormaDePago] = useState("Contado");
  const [formaDeEntrega, setFormaDeEntrega] = useState("Retiro en planta");
  const [tiempoDeEntrega, setTiempoDeEntrega] = useState("24 hrs");

  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Opciones para los desplegables
  const opcionesPago = ["Contado", "Transferencia", "WebPay", "Orden de Compra"];
  const opcionesEntrega = ["Retiro en planta", "Despacho a obra"];
  const opcionesTiempo = ["24 hrs", "48 hrs", "1 semana", "1 mes"];

  useEffect(() => {
    fetch(API_URL_VENDEDORES).then(res => res.json()).then(data => { if (Array.isArray(data)) setVendedores(data); }).catch((error: any) => console.error("Error al cargar vendedores:", error));
    fetch(API_URL_CONTADOR).then(res => res.json()).then(data => { if (data && typeof data.numero === 'number') setNumeroCotizacion(data.numero + 1); }).catch((error: any) => console.error("Error al cargar contador:", error));
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
    const nuevaCantidad = isNaN(cantidad) ? undefined : cantidad;
    setProductos(prev => prev.map((p, i) => i === index ? { ...p, cantidad: nuevaCantidad } : p));
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

  const generarPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    if (!pdfRef.current || !cliente || numeroCotizacion === null) return alert("Por favor, seleccione un cliente...");
    
    setIsProcessing(true);
    const element = pdfRef.current;
    const fileName = `cotizacion_${cliente.Cliente}_${numeroCotizacion}.pdf`;
    const opciones = { margin: 0, filename: fileName, image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' } };

    html2pdf().from(element).set(opciones).save()
      .then(() => {
        const productosAgrupados = productos.map(p => `${p.cantidad || 1} ${p.codigo}`).join(', ');
        const preciosAgrupados = productos.map(p => `$${p.precio.toLocaleString('es-CL')}`).join(', ');
        const registroData = {
          numeroCotizacion,
          fecha: new Date().toLocaleDateString('es-CL'),
          cliente: cliente.Cliente,
          rut: cliente.ID,
          vendedor: vendedorAsociado?.Vendedor || cliente.Vendedor,
          productosAgrupados,
          preciosAgrupados,
          subtotal
        };
        fetch(API_URL_REGISTRO, { method: 'POST', body: JSON.stringify(registroData), mode: 'no-cors' }).catch((error: any) => console.error("Error al registrar cotización:", error));
        fetch(API_URL_CONTADOR, { method: 'POST' });
        setNumeroCotizacion(prev => prev ? prev + 1 : 1);
      })
      .catch((err: any) => { console.error("Error al generar el PDF:", err); alert("Hubo un error al generar el PDF."); })
      .finally(() => { setIsProcessing(false); });
  };

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <Image src="/logo.png" alt="Logo Natstone" width={180} height={60} priority />
        <h1 style={{ marginLeft: '1.5rem', fontSize: '2rem' }}>Cotizador NatStone</h1>
      </div>

      <div className="client-details-form" style={{marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem'}}>
        <label>Forma de Pago:</label>
        <select value={formaDePago} onChange={(e) => setFormaDePago(e.target.value)}className="info-select">
          {opcionesPago.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <label>Forma de Entrega:</label>
        <select value={formaDeEntrega} onChange={(e) => setFormaDeEntrega(e.target.value)}className="info-select">
          {opcionesEntrega.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <label>Tiempo de Entrega:</label>
        <select value={tiempoDeEntrega} onChange={(e) => setTiempoDeEntrega(e.target.value)}className="info-select">
          {opcionesTiempo.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>
      
      <SelectCliente onClienteSeleccionado={(cliente) => setCliente(cliente)} />

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
                      <td className="table-cell"><input type="number" min={1} value={p.cantidad || ''} className="quantity-input" onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value))} /></td>
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
            disabled={isProcessing || numeroCotizacion === null}
            className="pdf-button"
          >
            {isProcessing ? 'Generando...' : (numeroCotizacion === null ? 'Cargando...' : `📄 Descargar y Registrar PDF No. ${numeroCotizacion}`)}
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
              formaDePago={formaDePago}
              formaDeEntrega={formaDeEntrega}
              tiempoDeEntrega={tiempoDeEntrega}
            />
          </div>
        )}
      </div>
    </main>
  );
}
