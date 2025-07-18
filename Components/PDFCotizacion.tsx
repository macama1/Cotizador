import React, { forwardRef } from "react";
import { Cliente, Vendedor, Producto } from '../types.d';

type Props = {
  cliente: Cliente;
  vendedor: Vendedor | null;
  productos: Producto[];
  numero: number;
  formaDePago: string;
  formaDeEntrega: string;
  tiempoDeEntrega: string;
};

const PDFCotizacion = forwardRef<HTMLDivElement, Props>(({ cliente, vendedor, productos, numero, formaDePago, formaDeEntrega, tiempoDeEntrega }, ref) => {
  const subtotal = productos.reduce((sum, p) => sum + (p.precio || 0) * (p.cantidad || 1), 0);
  const iva = Math.round(subtotal * 0.19);
  const totalAPagar = subtotal + iva;
  
  const styles: { [key: string]: React.CSSProperties } = {
    page: { padding: '10mm', fontFamily: 'Arial, sans-serif', fontSize: '8pt', color: '#000', width: '210mm', height: '279.4mm', boxSizing: 'border-box', backgroundColor: 'white' },
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
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '8pt', border: '1px solid black' },
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
          77057227-4<br/>
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
            <th style={{...styles.th, width: '12%'}}>CODIGO</th>
            <th style={{...styles.th, width: '35%', textAlign: 'left'}}>DESCRIPCIÓN</th>
            <th style={{...styles.th, width: '8%'}}>CANT.</th>
            <th style={{...styles.th, width: '15%'}}>PRECIO BASE</th>
            <th style={{...styles.th, width: '15%'}}>PRECIO ESPECIAL</th>
            <th style={{...styles.th, width: '5%'}}>% DCTO.</th>
            <th style={{...styles.th, width: '10%'}}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => {
            const precioEspecial = p.precio;
            const precioBase = p.precioBase || precioEspecial;
            const hayDescuento = precioBase && precioEspecial < precioBase;
            const descuento = hayDescuento ? Math.round(((precioBase - precioEspecial) / precioBase) * 100) : 0;

            return (
              <tr key={p.codigo}>
                <td style={{...styles.td, textAlign: 'center'}}>{p.codigo}</td>
                <td style={{...styles.td, textAlign: 'left'}}>{p.nombre}</td>
                <td style={{...styles.td, textAlign: 'center'}}>{p.cantidad || 1}</td>
                <td style={styles.td}>${precioBase.toLocaleString('es-CL')}</td>
                <td style={styles.td}>${precioEspecial.toLocaleString('es-CL')}</td>
                <td style={{...styles.td, textAlign: 'center', color: hayDescuento ? '#228B22' : 'inherit', fontWeight: hayDescuento ? 'bold' : 'normal'}}>
                  {descuento > 0 ? `${descuento}%` : '-'}
                </td>
                <td style={styles.td}>${(precioEspecial * (p.cantidad || 1)).toLocaleString('es-CL')}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 10 - productos.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={styles.td}>&nbsp;</td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={styles.footer}>
        <div style={styles.notes}>
          <div style={{...styles.clientLabel, width: 'auto'}}>NOTA:</div>
          <div style={{padding: '2mm'}}>
            Esta cotización es válida por 20 días corridos a partir de esta fecha.
            <br/><br/>
            <strong>Datos de Transferencia</strong><br/>
            BANCO CHILE<br/>
            00-800-36587-09<br/>
            PIETTRA SPA<br/>
            77.057.227-4
          </div>
        </div>
        <div style={styles.totals}>
          <div style={styles.totalRow}><strong>SUBTOTAL</strong><span>${subtotal.toLocaleString('es-CL')}</span></div>
          <div style={styles.totalRow}><strong>IVA (19%)</strong><span>${iva.toLocaleString('es-CL')}</span></div>
          <div style={{...styles.totalRow, backgroundColor: '#2d4373', color: 'white', fontWeight: 'bold', border: '1px solid black', flexGrow: 1, alignItems: 'center'}}>
            <strong>TOTAL A PAGAR</strong><span>${totalAPagar.toLocaleString('es-CL')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
});

PDFCotizacion.displayName = 'PDFCotizacion';
export default PDFCotizacion;
