import { jsPDF } from 'jspdf';
import { SelectDocument } from '../data/schemas';

export async function generateDocumentPDF(document: SelectDocument): Promise<Buffer> {
  try {
    // Create PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const textWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }

      const lines = pdf.splitTextToSize(text, textWidth);
      const lineHeight = fontSize * 0.5;

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.setFont(undefined, 'normal');
      yPosition += 2; // Add space after text
    };

    // Add title
    addText(document.title, 16, true);
    yPosition += 5;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(102, 102, 102); // Gray color

    const metadataLines = [
      `Paciente: ${document.patient_name}`,
      `RUT: ${document.patient_rut}`,
      `Fecha: ${new Date().toLocaleDateString('es-CL')}`,
    ];

    metadataLines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 3;
    pdf.setTextColor(0, 0, 0); // Reset to black

    // Add document content
    addText(document.content, 10, false);

    // Add signature section if signature exists
    if (document.signature_data) {
      yPosition += 5;

      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      addText('FIRMA DEL PACIENTE:', 10, true);
      yPosition += 3;

      try {
        const base64Data = document.signature_data.includes(',')
          ? document.signature_data.split(',')[1]
          : document.signature_data;

        // Add signature image
        const signatureBuffer = Buffer.from(base64Data, 'base64');
        const signatureDataUrl = `data:image/png;base64,${base64Data}`;

        pdf.addImage(signatureDataUrl, 'PNG', margin, yPosition, 50, 30);
        yPosition += 35;
      } catch (error) {
        console.error('❌ Error adding signature image to PDF:', error);
        addText('[Firma Digital]', 10, false);
      }
    }

    // Add footer to current page (don't add extra page)
    pdf.setFontSize(8);
    pdf.setTextColor(153, 153, 153); // Light gray

    // Get total pages to add footer to last page
    const totalPages = pdf.getNumberOfPages();
    pdf.setPage(totalPages);

    pdf.text(
      'Este documento ha sido generado electronicamente y es valido para efectos legales.',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
    pdf.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes, pages: ${totalPages}`);
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error creating PDF document:', error);
    throw error;
  }
}
