import { jsPDF } from 'jspdf';
import { SelectDocument, SelectPrescription } from '../data/schemas';

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

interface PrescriptionPDFData {
  prescription: SelectPrescription;
  patientName: string;
  patientRut: string;
  patientPhone: string;
  doctorName?: string;
  doctorRut?: string;
  doctorSignature?: string | null;
}

export async function generatePrescriptionPDF(data: PrescriptionPDFData): Promise<Buffer> {
  try {
    // Create PDF document using jsPDF (same as documents)
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

    // Cyan color (RGB conversion of #0891b2)
    const cyanColor: [number, number, number] = [8, 145, 178];
    const grayColor: [number, number, number] = [100, 116, 139];
    const darkGray: [number, number, number] = [55, 65, 81];

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      pdf.setTextColor(color[0], color[1], color[2]);

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
      pdf.setTextColor(0, 0, 0);
      yPosition += 2;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
    pdf.text('Receta Médica', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Doctor info (if available)
    if (data.doctorName) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
      pdf.text(data.doctorName, margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      pdf.text('CIRUJANO DENTISTA', margin, yPosition);
      yPosition += 5;

      if (data.doctorRut) {
        pdf.text(`RUT: ${data.doctorRut}`, margin, yPosition);
        yPosition += 5;
      }

      pdf.text('Especialista en Odontología General', margin, yPosition);
      yPosition += 10;
    }

    // Patient info box
    pdf.setDrawColor(cyanColor[0], cyanColor[1], cyanColor[2]);
    pdf.setFillColor(248, 250, 252); // #F8FAFC
    pdf.rect(margin, yPosition, textWidth, 25, 'FD');

    const boxY = yPosition;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    // Row 1
    pdf.text(`Paciente: ${data.patientName}`, margin + 3, boxY + 6);
    pdf.text(`Contacto: ${data.patientPhone}`, margin + 90, boxY + 6);

    // Row 2
    const currentDate = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`RUT: ${data.patientRut}`, margin + 3, boxY + 14);
    pdf.text(`Fecha: ${currentDate}`, margin + 90, boxY + 14);

    yPosition = boxY + 30;

    // Medications section
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
    pdf.text('INDICACIONES MÉDICAS', margin, yPosition);
    yPosition += 8;

    // Medications box
    const medBoxY = yPosition;
    pdf.setDrawColor(cyanColor[0], cyanColor[1], cyanColor[2]);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, medBoxY, textWidth, 50, 2, 2, 'S');

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    const medicationsLines = pdf.splitTextToSize(data.prescription.medications, textWidth - 6);
    pdf.text(medicationsLines, margin + 3, medBoxY + 6);

    yPosition = medBoxY + 55;

    // Footer note
    pdf.setFontSize(9);
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text('*Receta válida por 30 días desde la fecha de emisión', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Signature section
    if (data.doctorSignature) {
      try {
        const base64Data = data.doctorSignature.includes(',')
          ? data.doctorSignature.split(',')[1]
          : data.doctorSignature;

        const signatureDataUrl = `data:image/png;base64,${base64Data}`;
        pdf.addImage(signatureDataUrl, 'PNG', pageWidth / 2 - 25, yPosition, 50, 25);
        yPosition += 30;
      } catch (error) {
        console.error('Error adding signature:', error);
        yPosition += 15;
      }
    } else {
      yPosition += 15;
    }

    // Signature line and doctor name
    const lineStartX = pageWidth / 2 - 35;
    const lineEndX = pageWidth / 2 + 35;
    pdf.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.line(lineStartX, yPosition, lineEndX, yPosition);
    yPosition += 5;

    if (data.doctorName) {
      pdf.setFontSize(10);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text(data.doctorName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      if (data.doctorRut) {
        pdf.text(`RUT: ${data.doctorRut}`, pageWidth / 2, yPosition, { align: 'center' });
      }
    }

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    console.log(`✅ Prescription PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error creating prescription PDF:', error);
    throw error;
  }
}
