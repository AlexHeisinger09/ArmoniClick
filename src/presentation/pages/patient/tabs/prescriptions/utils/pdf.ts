import { Prescription } from "@/core/use-cases/prescriptions";
import { Patient } from "@/core/use-cases/patients";

interface DoctorData {
    name: string;
    lastName: string;
    rut?: string;
    signature?: string | null;
    logo?: string | null; // ✅ LOGO DEL DOCTOR
    profession?: string | null; // ✅ PROFESIÓN DEL DOCTOR
    specialty?: string | null; // ✅ ESPECIALIDAD DEL DOCTOR
}

export class PrescriptionPDFGenerator {
    private static getLogoPath(doctorData?: DoctorData): string {
        // Si el doctor tiene logo cargado, usarlo
        if (doctorData?.logo) {
            return doctorData.logo;
        }
        // Si no, usar el logo por defecto
        return '/logoPresupuesto.PNG';
    }

    private static getProfession(doctorData?: DoctorData): string {
        // Si el doctor tiene profesión cargada, usarla
        if (doctorData?.profession) {
            return doctorData.profession;
        }
        // Si no, usar el valor por defecto
        return 'CIRUJANO DENTISTA';
    }

    private static getSpecialty(doctorData?: DoctorData): string {
        // Si el doctor tiene especialidad cargada, usarla
        if (doctorData?.specialty) {
            return `Experto en ${doctorData.specialty}`;
        }
        // Si no, usar el valor por defecto
        return 'Experto en Odontología General';
    }

    private static generateHTMLContent(
        prescription: Prescription,
        patient: Patient,
        doctorData?: DoctorData
    ): string {
        const doctorName = doctorData ? `${doctorData.name} ${doctorData.lastName}` : "Doctor(a)";
        const doctorRut = doctorData?.rut || "Sin Rut";
        const logoPath = this.getLogoPath(doctorData); // ✅ USAR LOGO DEL DOCTOR O POR DEFECTO
        const profession = this.getProfession(doctorData); // ✅ USAR PROFESIÓN DEL DOCTOR O POR DEFECTO
        const specialty = this.getSpecialty(doctorData); // ✅ USAR ESPECIALIDAD DEL DOCTOR O POR DEFECTO
        const emissionDate = new Date().toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calcular edad del paciente
        const birthDate = new Date(patient.fecha_nacimiento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const birthDateFormatted = birthDate.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receta Médica</title>
    <style>
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #374151;
            background: white;
            padding: 20px;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }

        .doctor-info h2 {
            color: #0891b2;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .doctor-info p {
            color: #64748b;
            font-size: 14px;
            margin: 2px 0;
        }

        .title {
            text-align: center;
            font-size: 28px;
            font-weight: 700;
            color: #374151;
            margin: 20px 0;
        }

        .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #0891b2;
            margin: 20px 0;
        }

        .patient-data {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .patient-data p {
            color: #374151;
            font-size: 15px;
            margin: 0;
            line-height: 1.6;
        }

        .patient-data strong {
            color: #0891b2;
            font-weight: 600;
        }

        .medications {
            border: 2px solid #0891b2;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            min-height: 200px;
        }

        .medications h3 {
            color: #0891b2;
            font-size: 20px;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .medications-content {
            font-size: 16px;
            line-height: 2;
            white-space: pre-wrap;
            color: #374151;
        }

        .footer-note {
            text-align: center;
            font-style: italic;
            color: #64748b;
            margin-top: 30px;
            font-size: 14px;
        }

        .signature {
            margin-top: 60px;
            text-align: center;
        }

        .signature-img {
            max-height: 100px;
            max-width: 250px;
            margin: 20px auto;
            display: block;
        }

        .signature-line {
            border-top: 1px solid #374151;
            width: 250px;
            margin: 40px auto 10px;
        }

        .signature p {
            color: #374151;
            font-size: 14px;
            margin: 5px 0;
        }

        .footer-logo {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .footer-logo img {
            height: 40px;
            opacity: 0.8;
        }

        @media print {
            body {
                margin: 0;
                padding: 15px;
            }

            button,
            .no-print,
            .print-controls {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="${logoPath}" alt="Logo" class="logo" />
        <div class="doctor-info">
            <h2>${doctorName}</h2>
            <p>${profession}</p>
            <p>RUT: ${doctorRut}</p>
            <p>${specialty}</p>
        </div>
    </div>

    <h1 class="title">Receta Médica</h1>
    <p style="text-align: center; font-size: 14px; color: #64748b; margin-top: -10px; margin-bottom: 20px;">Fecha de emisión: ${emissionDate}</p>

    <div class="patient-info">
        <div class="patient-data">
            <p><strong>Paciente:</strong> ${patient.nombres} ${patient.apellidos}</p>
            <p><strong>Fec. de Nacimiento:</strong> ${birthDateFormatted} (${age} años)</p>
            <p><strong>RUT:</strong> ${patient.rut}</p>
            <p><strong>Contacto:</strong> ${patient.telefono}</p>
        </div>
    </div>

    <div class="medications">
        <h3>Indicaciones Médicas</h3>
        <div class="medications-content">${prescription.medications}</div>
    </div>

    <p class="footer-note">*Receta válida por 30 días desde la fecha de emisión</p>

    <div class="signature">
        ${doctorData?.signature ? `<img src="${doctorData.signature}" class="signature-img" alt="Firma del doctor" />` : ''}
        <div class="signature-line"></div>
        <p><strong>${doctorName}</strong></p>
        <p>RUT: ${doctorRut}</p>
    </div>

    <div class="footer-logo">
        <img src="/letras.PNG" alt="Logo Letras" />
    </div>

    <div class="print-controls" style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px;z-index:1000;">
        <button onclick="window.print()" style="padding:10px 20px;background:#0891b2;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            📄 Imprimir
        </button>
        <button onclick="window.close()" style="padding:10px 20px;background:#64748b;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            ✖ Cerrar
        </button>
    </div>
</body>
</html>`;

        return content;
    }

    // Método para VER la receta (abre ventana con HTML)
    public static async generatePrescriptionPDF(
        prescription: Prescription,
        patient: Patient,
        doctorData?: DoctorData
    ): Promise<void> {
        const content = this.generateHTMLContent(prescription, patient, doctorData);
        const win = window.open('', 'Receta Médica', 'width=800,height=900');
        if (win) {
            win.document.write(content);
            win.document.close();
        }
    }

    // Método para DESCARGAR la receta directamente como PDF
    public static async downloadPrescriptionPDF(
        prescription: Prescription,
        patient: Patient,
        doctorData?: DoctorData
    ): Promise<void> {
        const content = this.generateHTMLContent(prescription, patient, doctorData);

        // Abrir ventana temporal oculta
        const win = window.open('', '_blank', 'width=1,height=1');
        if (win) {
            win.document.write(content);
            win.document.close();

            // Esperar a que cargue y luego imprimir automáticamente
            setTimeout(() => {
                win.print();
                // Cerrar después de imprimir
                setTimeout(() => win.close(), 100);
            }, 250);
        }
    }

    public static async generatePDFBlob(
        prescription: Prescription,
        patient: Patient,
        doctorData?: DoctorData
    ): Promise<Blob> {
        // Importar jsPDF dinámicamente
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Crear un contenedor temporal con proporciones A4
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '210mm'; // Ancho A4 exacto
        container.style.padding = '20px';
        container.style.boxSizing = 'border-box';
        container.innerHTML = this.generateHTMLContent(prescription, patient, doctorData);
        document.body.appendChild(container);

        try {
            // Capturar como canvas con alta calidad para descarga
            const canvas = await html2canvas(container, {
                scale: 2, // Mantener escala 2 para buena calidad
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Crear PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Usar PNG para mejor calidad de firma y texto
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Agregar imagen con márgenes para que no quede pegada a los bordes
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Convertir a blob
            return pdf.output('blob');
        } finally {
            document.body.removeChild(container);
        }
    }

    public static async sharePDFViaWhatsApp(
        prescription: Prescription,
        patient: Patient,
        doctorData?: DoctorData
    ): Promise<boolean> {
        try {
            // Verificar si el navegador soporta Web Share API con archivos
            if (navigator.share && navigator.canShare) {
                const blob = await this.generatePDFBlob(prescription, patient, doctorData);
                const file = new File(
                    [blob],
                    `Receta_${patient.nombres}_${patient.apellidos}.pdf`,
                    { type: 'application/pdf' }
                );

                const shareData = {
                    title: 'Receta Médica',
                    text: `Receta médica para ${patient.nombres} ${patient.apellidos}`,
                    files: [file]
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error sharing PDF:', error);
            return false;
        }
    }
}
