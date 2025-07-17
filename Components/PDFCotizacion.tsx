import React, { forwardRef } from "react";
import { Cliente, Vendedor, Producto } from '../types.d';

// 👇 1. AÑADE LAS NUEVAS PROPS AQUÍ
type Props = {
  cliente: Cliente;
  vendedor: Vendedor | null;
  productos: Producto[];
  numero: number;
  formaDePago: string;
  formaDeEntrega: string;
  tiempoDeEntrega: string;
};

// 👇 2. RECIBE LAS NUEVAS PROPS AQUÍ
const PDFCotizacion = forwardRef<HTMLDivElement, Props>(({ cliente, vendedor, productos, numero, formaDePago, formaDeEntrega, tiempoDeEntrega }, ref) => {
  const subtotal = productos.reduce((sum, p) => sum + (p.precio || 0) * (p.cantidad || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const totalAPagar = subtotal + iva;
  
  const styles: { [key: string]: React.CSSProperties } = {
    page: { padding: '10mm', fontFamily: 'Arial, sans-serif', fontSize: '9pt', color: '#000', width: '210mm', height: '279.4mm', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' },
    logo: { width: '50mm' },
    companyInfo: { textAlign: 'right', fontSize: '9pt' },
    infoGrid: { display: 'flex', justifyContent: 'space-between', marginBottom: '5mm' },
    infoBox: { flex: 1, textAlign: 'center', margin: '0 1mm' },
    infoLabel: { backgroundColor: '#3b5998', color: 'white', padding: '1.5mm', fontSize: '8pt', fontWeight: 'bold' },
    infoValue: { padding: '1.5mm', border: '1px solid black', borderTop: 'none', minHeight: '6mm' },
    clientGrid: { border: '1px solid black', marginBottom: '5mm' },
    clientRow: { display: 'flex', borderBottom: '1px solid black' },
    clientLabel: { backgroundColor: '#2d4373', color: 'white', padding: '1.5mm', fontWeight: 'bold', width: '30mm', fontSize: '8pt' },
    clientValue: { padding: '1.5mm', flexGrow: 1, backgroundColor: '#fff' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', border: '1px solid black' },
    th: { backgroundColor: '#e0e0e0', padding: '1.5mm', border: '1px solid black', fontWeight: 'bold' },
    td: { padding: '1.5mm', border: '1px solid black', textAlign: 'right', backgroundColor: '#fff' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '5mm', alignItems: 'flex-start' },
    notes: { border: '1px solid black', width: '60%', fontSize: '8pt' },
    totals: { width: '38%' },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '1.5mm', border: '1px solid black', backgroundColor: '#e0e0e0'},
  };

  return (
    <div ref={ref} style={styles.page}>
      <header style={styles.header}>
        <img src="/logo.png" alt="Logo" style={styles.logo} />
        <div style={styles.companyInfo}>
          <strong>{vendedor?.Vendedor || cliente.Vendedor}</strong><br /> 
          PIETTRA SPA<br />
          77057227 - 4<br/>
          Panamericana Norte 18.800, Lote 4, Lampa - Santiago<br />
          Tel. {vendedor?.Número || ''}<br />
          <a href={`mailto:${vendedor?.Correo || ''}`}>{vendedor?.Correo || ''}</a><br />
          www.natstone.cl
        </div>
      </header>
      
      <section style={styles.infoGrid}>
        <div style={styles.infoBox}><div style={styles.infoLabel}>Cotización N°.</div><div style={styles.infoValue}>{numero}</div></div>
        <div style={styles.infoBox}><div style={styles.infoLabel}>Fecha</div><div style={styles.infoValue}>{new Date().toLocaleDateString('es-CL')}</div></div>
        <div style={styles.infoBox}><div style={styles.infoLabel}>Hora</div><div style={styles.infoValue}>{new Date().toLocaleTimeString('es-CL')}</div></div>
      </section>
      
      {/* 👇 3. MUESTRA LOS NUEVOS VALORES EN EL PDF */}
      <section style={styles.infoGrid}>
          <div style={styles.infoBox}><div style={styles.infoLabel}>FORMA DE PAGO</div><div style={styles.infoValue}>{formaDePago || '\u00A0'}</div></div>
          <div style={styles.infoBox}><div style={styles.infoLabel}>FORMA DE ENTREGA</div><div style={styles.infoValue}>{formaDeEntrega || '\u00A0'}</div></div>
          <div style={styles.infoBox}><div style={styles.infoLabel}>TIEMPO DE ENTREGA</div><div style={styles.infoValue}>{tiempoDeEntrega || '\u00A0'}</div></div>
      </section>

      <section style={styles.clientGrid}>
        <div style={styles.clientRow}><div style={styles.clientLabel}>CLIENTE</div><div style={styles.clientValue}>{cliente.Cliente}</div></div>
        <div style={styles.clientRow}><div style={styles.clientLabel}>RUT</div><div style={styles.clientValue}>{cliente.ID}</div></div>
        <div style={styles.clientRow}><div style={styles.clientLabel}>DIRECCIÓN</div><div style={styles.clientValue}>{cliente.Direccion || ''}</div></div>
        <div style={styles.clientRow}><div style={styles.clientLabel}>CORREO</div><div style={styles.clientValue}>{cliente.Correo || ''}</div></div>
        <div style={{...styles.clientRow, borderBottom: 'none'}}><div style={styles.clientLabel}>TELÉFONO</div><div style={styles.clientValue}>{cliente.Telefono || ''}</div></div>
      </section>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.th, width: '15%'}}>CODIGO</th>
            <th style={{...styles.th, width: '45%', textAlign: 'left'}}>DESCRIPCIÓN</th>
            <th style={{...styles.th, width: '10%'}}>CANTIDAD</th>
            <th style={{...styles.th, width: '15%'}}>PRECIO</th>
            <th style={{...styles.th, width: '15%'}}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.codigo}>
              <td style={{...styles.td, textAlign: 'center'}}>{p.codigo}</td>
              <td style={{...styles.td, textAlign: 'left'}}>{p.nombre}</td>
              <td style={{...styles.td, textAlign: 'center'}}>{p.cantidad || 1}</td>
              <td style={styles.td}>${p.precio.toLocaleString('es-CL')}</td>
              <td style={styles.td}>${(p.precio * (p.cantidad || 1)).toLocaleString('es-CL')}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 12 - productos.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={styles.td}>&nbsp;</td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={styles.footer}>
        <div style={styles.notes}>
          <div style={{...styles.clientLabel, width: 'auto'}}>NOTA:</div>
          <div style={{padding: '2mm'}}>Esta cotización es válida por 20 días corridos a partir de esta fecha</div>
        </div>
        <div style={styles.totals}>
          <div style={styles.totalRow}><strong>SUBTOTAL</strong><span>${subtotal.toLocaleString('es-CL')}</span></div>
          <div style={styles.totalRow}><strong>IVA</strong><span>${iva.toLocaleString('es-CL')}</span></div>
          <div style={{...styles.totalRow, backgroundColor: '#2d4373', color: 'white', fontWeight: 'bold', border: '1px solid black'}}><strong>TOTAL A PAGAR</strong><span>${totalAPagar.toLocaleString('es-CL')}</span></div>
        </div>
      </footer>
    </div>
  );
});

PDFCotizacion.displayName = 'PDFCotizacion';
export default PDFCotizacion;
