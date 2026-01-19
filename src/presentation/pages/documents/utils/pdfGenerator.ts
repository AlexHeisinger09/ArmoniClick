import { Document } from '@/core/use-cases/documents/types';

interface DoctorData {
  name: string;
  lastName: string;
  rut?: string;
  logo?: string | null;
  profession?: string | null;
  specialty?: string | null;
}

/**
 * Genera un PDF del documento para descargar en el navegador del cliente
 * @param document - Documento con título y contenido
 * @param signature - Firma en formato base64 (opcional, se puede pasar en el documento)
 * @param doctorData - Datos del doctor para el encabezado
 */
export const generateDocumentPDF = async (
  document: Document,
  signature?: string,
  doctorData?: DoctorData
) => {
  // Usar firma del documento si no se proporciona como parámetro
  const signatureToUse = signature || document.signature_data;
  const { jsPDF } = await import('jspdf');
  const pageWidth = 210; // A4 width en mm
  const pageHeight = 297; // A4 height en mm
  const margins = 20;
  const contentWidth = pageWidth - 2 * margins;

  const doc = new jsPDF('p', 'mm', 'a4');

  let currentY = margins;

  // ✅ ENCABEZADO CON LOGO Y DATOS DEL DOCTOR
  if (doctorData) {
    try {
      const logoPath = doctorData.logo || '/logoPresupuesto.PNG';
      const doctorName = `${doctorData.name} ${doctorData.lastName}`;
      const profession = doctorData.profession || 'CIRUJANO DENTISTA';
      const specialty = doctorData.specialty ? `Experto en ${doctorData.specialty}` : 'Experto en Odontología General';

      // Agregar logo (80x80mm aproximadamente 30x30px en mm)
      if (logoPath) {
        try {
          doc.addImage(logoPath, 'PNG', margins, currentY, 30, 30);
        } catch (error) {
          console.error('Error al cargar logo:', error);
        }
      }

      // Datos del doctor al lado del logo
      const doctorInfoX = margins + 35;
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(8, 145, 178); // Color cyan
      doc.text(doctorName, doctorInfoX, currentY + 7);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // Color gris
      doc.text(profession, doctorInfoX, currentY + 14);

      if (doctorData.rut) {
        doc.text(`RUT: ${doctorData.rut}`, doctorInfoX, currentY + 19);
      }

      doc.text(specialty, doctorInfoX, currentY + 24);

      currentY += 40; // Espacio después del encabezado
    } catch (error) {
      console.error('Error al renderizar encabezado:', error);
      currentY += 10;
    }
  }

  // Línea separadora
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margins, currentY, pageWidth - margins, currentY);
  currentY += 10;

  // Título del documento
  doc.setFontSize(18);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(55, 65, 81); // Color oscuro
  const titleLines = doc.splitTextToSize(document.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 7 + 15;

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