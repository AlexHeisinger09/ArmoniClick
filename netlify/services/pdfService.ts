import PDFDocument from 'pdfkit';
import { SelectDocument } from '../data/schemas';

export async function generateDocumentPDF(document: SelectDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = new PDFDocument({
        margin: 50,
        bufferPages: true,
      });

      // Buffer to accumulate PDF data
      const chunks: any[] = [];

      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      pdfDoc.on('error', (err) => {
        reject(err);
      });

      // Add header
      pdfDoc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(document.title, { align: 'center' })
        .moveDown(0.5);

      // Add metadata
      pdfDoc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Paciente: ${document.patient_name}`, { align: 'left' })
        .text(`RUT: ${document.patient_rut}`)
        .text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`)
        .moveDown(1);

      // Reset color and font for content
      pdfDoc.fillColor('#000000').font('Helvetica');

      // Add document content
      pdfDoc.fontSize(11).text(document.content, {
        align: 'left',
        lineGap: 5,
        width: 490,
      });

      pdfDoc.moveDown(1);

      // Add signature section if signature exists
      if (document.signature_data) {
        pdfDoc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('FIRMA DEL PACIENTE:', { align: 'left' })
          .moveDown(0.5);

        // Add signature image
        try {
          const base64Data = document.signature_data.split(',')[1] || document.signature_data;
          const signatureBuffer = Buffer.from(base64Data, 'base64');
          pdfDoc.image(signatureBuffer, 50, pdfDoc.y, {
            width: 150,
            height: 80,
          });
          pdfDoc.moveDown(4);
        } catch (error) {
          console.error('Error adding signature image to PDF:', error);
          pdfDoc.text('[Firma Digital]', { align: 'left' }).moveDown(1);
        }
      }

      // Add footer
      pdfDoc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          'Este documento ha sido generado electrónicamente y es válido para efectos legales.',
          { align: 'center' }
        )
        .text(
          `Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`,
          { align: 'center' }
        );

      // Finalize PDF
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}
