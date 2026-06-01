import PDFDocument from 'pdfkit-table';
import { Response } from 'express';

export const generateVentasProductoPdf = (res: Response, data: any[], fecha: string) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Configurar las cabeceras de respuesta para descargar el PDF
  res.setHeader('Content-disposition', `attachment; filename="Reporte_Ventas_${fecha}.pdf"`);
  res.setHeader('Content-type', 'application/pdf');
  
  doc.pipe(res);

  // Título del Reporte
  doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Productos Vendidos`, { align: 'center' });
  doc.fontSize(12).text(`Fecha: ${fecha}`, { align: 'center' });
  doc.moveDown(2);

  // Calcular los totales generales
  const totalMonto = data.reduce((sum, item) => sum + Number(item.totalMontoVendido || 0), 0);

  const formatOptions = { minimumFractionDigits: 0 };
  
  const mappedData = data.map(item => ({
    nombre: item.nombre,
    TotalVendido: Number(item.TotalVendido).toFixed(2),
    totalMontoVendido: Number(item.totalMontoVendido).toLocaleString('es-PY', formatOptions)
  }));

  // Agregar la fila de totales
  mappedData.push({
    nombre: 'TOTAL GENERAL',
    TotalVendido: '',
    totalMontoVendido: totalMonto.toLocaleString('es-PY', formatOptions)
  });

  // Opciones y datos para la tabla
  const tableData = {
    headers: [
      { label: "Nombre del Producto", property: 'nombre', width: 250 },
      { label: "Total Vendido", property: 'TotalVendido', width: 100, align: 'right' as const },
      { label: "Monto Vendido ($)", property: 'totalMontoVendido', width: 120, align: 'right' as const }
    ],
    datas: mappedData
  };

  // Dibujar la tabla
  doc.table(tableData, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, iColumn, iRow, rectRow, rectCell) => {
      // Hacer la fila de TOTAL GENERAL en negrita
      if (row.nombre === 'TOTAL GENERAL') {
        doc.font("Helvetica-Bold").fontSize(10);
      } else {
        doc.font("Helvetica").fontSize(10);
      }
      return doc;
    }
  });

  // Finalizar el documento
  doc.end();
};
