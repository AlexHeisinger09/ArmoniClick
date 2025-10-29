import { Document } from '@/core/use-cases/documents/types';

/**
 * Genera un PDF del documento para descargar en el navegador del cliente
 * @param document - Documento con título y contenido
 * @param signature - Firma en formato base64 (opcional, se puede pasar en el documento)
 */
export const generateDocumentPDF = async (document: Document, signature?: string) => {
  // Usar firma del documento si no se proporciona como parámetro
  const signatureToUse = signature || document.signature_data;
  const { jsPDF } = await import('jspdf');
  const pageWidth = 210; // A4 width en mm
  const pageHeight = 297; // A4 height en mm
  const margins = 20;
  const contentWidth = pageWidth - 2 * margins;

  const doc = new jsPDF('p', 'mm', 'a4');

  let currentY = margins;

  // Encabezado - Título del documento
  doc.setFontSize(16);
  doc.setFont('Helvetica', 'bold');
  const titleLines = doc.splitTextToSize(document.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 7 + 10;

  // Contenido del documento
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0);
  doc.setFontSize(11);

  const contentLines = doc.splitTextToSize(document.content, contentWidth);

  // Paginar el contenido si es necesario
  contentLines.forEach((line: string) => {
    if (currentY > pageHeight - margins - 40) {
      // Agregar nueva página si es necesario
      doc.addPage();
      currentY = margins;
    }
    doc.text(line, margins, currentY);
    currentY += 5;
  });

  // Espacio para firma
  currentY += 10;

  if (currentY > pageHeight - margins - 40) {
    doc.addPage();
    currentY = margins;
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FIRMA DEL PACIENTE:', margins, currentY);
  currentY += 10;

  // Agregar firma si existe
  if (signatureToUse) {
    try {
      // Extraer datos base64 si es necesario
      const signatureData = signatureToUse.includes(',') ? signatureToUse.split(',')[1] : signatureToUse;
      doc.addImage(signatureData, 'PNG', margins, currentY, 80, 40);
      currentY += 50;
    } catch (error) {
      console.error('Error al agregar firma al PDF:', error);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('(Firma digital)', margins, currentY);
      currentY += 15;
    }
  } else {
    currentY += 15;
  }

  // Agregar fecha final
  if (currentY > pageHeight - margins - 20) {
    doc.addPage();
    currentY = margins;
  }

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  const signedOrCreatedDate = document.signed_date ? new Date(document.signed_date).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL');
  const signedOrCreatedTime = document.signed_date ? new Date(document.signed_date).toLocaleTimeString('es-CL') : new Date().toLocaleTimeString('es-CL');
  doc.text(`Fecha de ${document.signature_data ? 'firma' : 'creación'}: ${signedOrCreatedDate} a las ${signedOrCreatedTime}`, margins, currentY);

  // Pie de página
  const pageCount = doc.internal.pages.length;
  doc.setFontSize(9);
  doc.setTextColor(150);

  for (let i = 1; i < pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${pageCount - 1}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const filename = `${document.title.replace(/\s+/g, '_')}_${document.patient_name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(filename);
};