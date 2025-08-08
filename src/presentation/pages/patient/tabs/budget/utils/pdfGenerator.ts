// src/presentation/pages/patient/tabs/budget/utils/pdfGenerator.ts
import { Budget } from "@/core/use-cases/budgets";
import { Patient } from "@/core/use-cases/patients";
import { BudgetFormUtils } from "../types/budget.types";

interface DoctorData {
    name: string;
    lastName: string;
    rut?: string;
    signature?: string | null; // ✅ AGREGAR CAMPO SIGNATURE
}

interface PDFGeneratorOptions {
    budget: Budget;
    patient: Patient;
    doctorData?: DoctorData;
}

export class PDFGenerator {
    private static getLogoPath(budgetType: string): string {
        return budgetType === 'odontologico' ? '/logoPresupuesto.PNG' : '/logo.PNG';
    }

    private static getBudgetTitle(budgetType: string): string {
        return budgetType === 'odontologico' ? 'Presupuesto Odontológico' : 'Presupuesto Estético';
    }

    private static getCurrentDate(): string {
        return new Date().toLocaleDateString('es-CL');
    }

    private static getDoctorName(doctorData?: DoctorData): string {
        return doctorData ? `${doctorData.name} ${doctorData.lastName}` : "Doctor(a)";
    }

    private static getDoctorRut(doctorData?: DoctorData): string {
        return doctorData?.rut ? doctorData.rut : "Sin Rut";
    }

    // ✅ NUEVA FUNCIÓN: Obtener firma del doctor
    private static getDoctorSignature(doctorData?: DoctorData): string | null {
        return doctorData?.signature || null;
    }

    private static getSpecialty(budgetType: string): string {
        return budgetType === 'odontologico' ? 'Odontología General' : 'Estética Dental';
    }

    // ✅ NUEVA FUNCIÓN: Generar HTML para la sección de firma
    private static generateSignatureSection(doctorData?: DoctorData): string {
        const doctorName = this.getDoctorName(doctorData);
        const doctorRut = this.getDoctorRut(doctorData);
        const doctorSignature = this.getDoctorSignature(doctorData);

        if (doctorSignature) {
            // Si tiene firma digital, mostrarla
            return `
                <div class="signature-section">
                    <img
                        src="${doctorSignature}"
                        alt="Firma del doctor"
                        class="signature-img"
                        style="max-height: 100px; max-width: 250px; object-fit: contain;"
                    />
                    <div class="signature-line"></div>
                    <p><strong>${doctorName}</strong></p>
                    <p>RUT: ${doctorRut}</p>
                </div>
            `;
        } else {
            // Si no tiene firma digital, mostrar línea para firma manual
            return `
                <div class="signature-section">
                    <div class="signature-placeholder">
                        <div class="signature-space"></div>
                    </div>
                    <div class="signature-line"></div>
                    <p><strong>${doctorName}</strong></p>
                    <p>RUT: ${doctorRut}</p>
                </div>
            `;
        }
    }

    private static generatePDFContent(options: PDFGeneratorOptions): string {
        const { budget, patient, doctorData } = options;
        const currentDate = this.getCurrentDate();
        const doctorName = this.getDoctorName(doctorData);
        const doctorRut = this.getDoctorRut(doctorData);
        const budgetTitle = this.getBudgetTitle(budget.budget_type);
        const logoPath = this.getLogoPath(budget.budget_type);
        const specialty = this.getSpecialty(budget.budget_type);
        const signatureSection = this.generateSignatureSection(doctorData); // ✅ USAR FUNCIÓN DINÁMICA

        return `
<!DOCTYPE html>
<html>
<head>
    <title>${budgetTitle} - ${patient.nombres} ${patient.apellidos}</title>
    <meta charset="UTF-8">
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
        
        .budget-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        
        .logo-doctor-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo-container {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
        }
        
        .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .doctor-info {
            text-align: left;
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
        
        .budget-title-section {
            text-align: center;
            flex: 1;
            padding: 0 20px;
        }
        
        .budget-title {
            color: #374151;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        
        .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #0891b2;
        }
        
        .patient-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .patient-field {
            display: flex;
            justify-content: space-between;
        }
        
        .patient-field strong {
            color: #374151;
            font-weight: 600;
        }
        
        .patient-field span {
            color: #64748b;
        }
        
        .budget-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .budget-table th {
            background: linear-gradient(135deg, #0891b2, #06b6d4);
            color: white;
            font-weight: 600;
            padding: 16px;
            text-align: left;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .budget-table tbody tr {
            background: white;
        }
        
        .budget-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .budget-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        
        .total-row {
            background: #f1f5f9 !important;
            font-weight: 700;
            font-size: 16px;
            border-top: 2px solid #0891b2;
        }
        
        .total-amount {
            color: #0891b2;
            font-size: 18px;
            font-weight: bold;
        }
        
        .footer-note {
            margin-top: 30px;
            font-style: italic;
            color: #64748b;
            font-size: 12px;
            text-align: center;
        }
        
        .signature-section {
            margin-top: 50px;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #374151;
            width: 250px;
            margin: 40px auto 10px;
        }
        
        .date-section {
            margin-top: 30px;
            text-align: right;
            color: #64748b;
            font-size: 14px;
        }
        
        .signature-img {
            height: 100px;
            margin: 20px auto;
            display: block;
        }
        
        /* ✅ NUEVOS ESTILOS: Para cuando no hay firma digital */
        .signature-placeholder {
            margin: 20px auto;
            text-align: center;
        }
        
        .signature-space {
            height: 80px;
            width: 250px;
            margin: 0 auto;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 14px;
            background: #f8fafc;
        }
        
        .signature-space::before {
            content: "Espacio para firma manual";
            font-style: italic;
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
            
            /* ✅ En impresión, no mostrar el mensaje de firma manual */
            .signature-space::before {
                content: "";
            }
            
            .signature-space {
                border: none;
                background: transparent;
            }
        }
    </style>
</head>
<body>
    <!-- Encabezado con logo y datos del doctor -->
    <div class="budget-header">
        <div class="logo-doctor-section">
            <div class="logo-container">
                <img src="${logoPath}" alt="Logo" />
            </div>
            <div class="doctor-info">
                <h2>${doctorName}</h2>
                <p>CIRUJANO DENTISTA</p>
                <p>RUT: ${doctorRut}</p>
                <p>Especialista en ${specialty}</p>
            </div>
        </div>
    </div>

    <div class="budget-title-section">
        <h1 class="budget-title">${budgetTitle}</h1>
    </div>

    <!-- Información del paciente -->
    <div class="patient-info">
        <div class="patient-grid">
            <div class="patient-field">
                <strong>Paciente:</strong>
                <span>${patient.nombres} ${patient.apellidos}</span>
            </div>
            <div class="patient-field">
                <strong>Contacto:</strong>
                <span>${patient.telefono}</span>
            </div>
            <div class="patient-field">
                <strong>Rut:</strong>
                <span>${patient.rut}</span>
            </div>
            <div class="patient-field">
                <strong>Fecha:</strong>
                <span>${currentDate}</span>
            </div>
        </div>
    </div>

    <!-- Tabla de tratamientos -->
    ${budget.items.length > 0 ? `
    <table class="budget-table">
        <thead>
            <tr>
                <th style="width: 15%">
                    ${budget.budget_type === 'odontologico' ? 'Piezas' : 'Zonas'}
                </th>
                <th style="width: 65%">Tratamiento</th>
                <th style="width: 20%; text-align: right">Valor</th>
            </tr>
        </thead>
        <tbody>
            ${budget.items.map(item => `
                <tr>
                    <td>${item.pieza || '-'}</td>
                    <td>${item.accion || '-'}</td>
                    <td style="text-align: right; font-weight: 600; color: #059669">
                        $${BudgetFormUtils.formatCurrency(parseFloat(item.valor.toString()) || 0)}
                    </td>
                </tr>
            `).join('')}
            
            <!-- Fila del total -->
            <tr class="total-row">
                <td colspan="2" style="font-weight: bold; color: #374151;">
                    <strong>TOTAL</strong>
                </td>
                <td style="text-align: right;" class="total-amount">
                    <strong>$${BudgetFormUtils.formatCurrency(parseFloat(budget.total_amount))}</strong>
                </td>
            </tr>
        </tbody>
    </table>
    ` : ''}

    <div class="footer-note">
        *Queda sujeto a modificaciones según evaluación clínica
    </div>

    <!-- ✅ Sección de firma dinámica -->
    ${signatureSection}

    <div class="date-section">
        <p>Fecha de emisión: ${currentDate}</p>
    </div>

    <!-- Pie de página con logo de letras -->
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
</html>
        `;
    }

    public static generatePDF(options: PDFGeneratorOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const { budget, patient } = options;
                const budgetTitle = this.getBudgetTitle(budget.budget_type);
                
                if (budget.items.length === 0) {
                    throw new Error('Agrega al menos un tratamiento antes de generar el PDF');
                }

                const windowFeatures = `
                    width=${screen.width * 0.8},
                    height=${screen.height * 0.8},
                    left=${screen.width * 0.1},
                    top=${screen.height * 0.1},
                    menubar=no,
                    toolbar=no,
                    location=no,
                    resizable=yes,
                    scrollbars=yes,
                    status=no
                `;

                const printWindow = window.open('', budgetTitle, windowFeatures);

                if (printWindow) {
                    const pdfContent = this.generatePDFContent(options);
                    printWindow.document.write(pdfContent);
                    printWindow.document.close();
                    
                    printWindow.onload = () => {
                        printWindow.focus();
                        resolve();
                    };

                    // Fallback si onload no se ejecuta
                    setTimeout(() => {
                        resolve();
                    }, 250);
                    
                } else {
                    reject(new Error('No se pudo abrir la ventana para imprimir'));
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Método de conveniencia para generar PDF con datos mínimos
    public static async generateBudgetPDF(
        budget: Budget, 
        patient: Patient, 
        doctorData?: DoctorData
    ): Promise<void> {
        return this.generatePDF({
            budget,
            patient,
            doctorData
        });
    }
}