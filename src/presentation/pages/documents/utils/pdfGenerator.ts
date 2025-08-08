export const generateDocumentPDF = async (document: any, patient: any, signature?: string) => {
  // Usar jsPDF o similar para generar PDF
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Configurar documento
  doc.setFontSize(16);
  doc.text('CONSENTIMIENTO INFORMADO', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('PARA TRATAMIENTO ODONTOLÓGICO', 105, 30, { align: 'center' });

  // Agregar información del paciente
  doc.setFontSize(12);
  doc.text(`Paciente: ${patient.nombres} ${patient.apellidos}`, 20, 50);
  doc.text(`RUT: ${patient.rut}`, 20, 60);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 70);

  // Agregar contenido del documento
  const content = document.content || getDefaultConsentContent();
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 90);

  // Agregar firma si existe
  if (signature) {
    doc.text('Firma del paciente:', 20, 250);
    doc.addImage(signature, 'PNG', 20, 255, 60, 30);
  }

  // Descargar
  doc.save(`${document.type}_${patient.nombres}_${patient.apellidos}.pdf`);
};

const getDefaultConsentContent = () => {
  return `Declaro que he cumplido todas las explicaciones que se me han facilitado en un lenguaje claro y sencillo. He sido informado para realizar todas las observaciones y he sido informado aclarado todas las dudas.

He entendido el médico tratante de las patologías que presento, sin ocultar enfermedades de la piel ni mucosas (herpes labial, alergias, problemas de cicatrización) que puedan afectar el tratamiento.

Entiendo que si no informo con la verdad todos los datos necesarios o incumplo las indicaciones a seguir posterior al procedimiento en cuestión, se pueden ocasionar resultados no deseables y estaré exento de responsabilidad profesional del facultativo/a.

Comprendo que a pesar de la adecuada elección de tratamiento y de su correcta realización, la duración del efecto conseguido es variable (de 3 a 8 meses) dependiendo de factores individuales de cada organismo y pueden presentarse efectos secundarios inmediatos como: hinchazón, enrojecimiento, dolor, escozor o hematomas y que en contadas ocasiones puede aparecer efectos secundarios tardíos como: infección / necrosis.

Por lo tanto, otorgo mi consentimiento para realizar el tratamiento que se me ha ofrecido y autorizo el uso de material de imagen y video registrados antes, durante y después del procedimiento para fines exclusivos del tratamiento.`;
};