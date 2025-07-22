// src/presentation/pages/patient/BudgetComponent.tsx
import React, { useState, useRef } from 'react';
import {
    Plus,
    Trash2,
    FileText,
    Download,
    Calculator,
    DollarSign,
    Save,
    Edit,
    X,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { useLoginMutation, useProfile } from "@/presentation/hooks";

interface BudgetItem {
    id: string;
    pieza: string;
    accion: string;
    valor: number;
}

interface BudgetProps {
    patient: {
        id: number;
        nombres: string;
        apellidos: string;
        rut: string;
        telefono: string;
        email: string;
        direccion: string;
        ciudad: string;
    };
}

interface NotificationProps {
    type: 'success' | 'error' | 'info';
    message: string;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
            default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-lg border shadow-lg ${getBgColor()}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 flex-shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const BudgetComponent: React.FC<BudgetProps> = ({ patient }) => {
    const [items, setItems] = useState<BudgetItem[]>([]);
    const [newItem, setNewItem] = useState({
        pieza: '',
        accion: '',
        valor: ''
    });
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState({
        pieza: '',
        accion: '',
        valor: ''
    });
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    const doctorData = queryProfile.data;
    const doctorName = doctorData ? `${doctorData.name} ${doctorData.lastName}` : "Doctor(a)";
    const doctorRut = doctorData?.id ? doctorData.id : "Sin Rut";

    const commonTreatments = [
        'Destartraje',
        'Resina Compuesta OM',
        'Resina Compuesta OD',
        'Corona Cerámica',
        'Corona Metal-Cerámica',
        'Endodoncia Premolar',
        'Endodoncia Molar',
        'Extracción Simple',
        'Extracción Quirúrgica',
        'Implante Dental',
        'Blanqueamiento',
        'Prótesis Parcial',
        'Prótesis Total',
        'Ortodoncia',
        'Limpieza Dental',
        'Sellante',
        'Pulpotomía',
        'Apiceptomía'
    ];

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('es-CL');
    };

    const calculateTotal = (): number => {
        return items.reduce((total, item) => total + item.valor, 0);
    };

    const handleAddItem = () => {
        if (!newItem.pieza || !newItem.accion || !newItem.valor) {
            showNotification('error', 'Por favor completa todos los campos');
            return;
        }

        const valor = parseFloat(newItem.valor.replace(/\./g, ''));
        if (isNaN(valor) || valor <= 0) {
            showNotification('error', 'El valor debe ser un número válido mayor a 0');
            return;
        }

        const item: BudgetItem = {
            id: Date.now().toString(),
            pieza: newItem.pieza,
            accion: newItem.accion,
            valor: valor
        };

        setItems([...items, item]);
        setNewItem({ pieza: '', accion: '', valor: '' });
        showNotification('success', 'Tratamiento agregado exitosamente');
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        showNotification('success', 'Tratamiento eliminado');
    };

    const startEditing = (item: BudgetItem) => {
        setIsEditing(item.id);
        setEditingItem({
            pieza: item.pieza,
            accion: item.accion,
            valor: item.valor.toString()
        });
    };

    const cancelEditing = () => {
        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
    };

    const saveEditing = () => {
        if (!editingItem.pieza || !editingItem.accion || !editingItem.valor) {
            showNotification('error', 'Por favor completa todos los campos');
            return;
        }

        const valor = parseFloat(editingItem.valor.replace(/\./g, ''));
        if (isNaN(valor) || valor <= 0) {
            showNotification('error', 'El valor debe ser un número válido mayor a 0');
            return;
        }

        setItems(items.map(item =>
            item.id === isEditing
                ? { ...item, pieza: editingItem.pieza, accion: editingItem.accion, valor: valor }
                : item
        ));

        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
        showNotification('success', 'Tratamiento actualizado');
    };

    const handleValueChange = (value: string, setter: (obj: any) => void, field: string) => {
        const cleanValue = value.replace(/[^\d]/g, '');
        const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        setter((prev: any) => ({ ...prev, [field]: formattedValue }));
    };

    const generatePDF = () => {
        setIsGeneratingPDF(true);
        const printContent = printRef.current;
        if (!printContent) {
            showNotification('error', 'Error al generar PDF');
            setIsGeneratingPDF(false);
            return;
        }

        if (items.length === 0) {
            showNotification('error', 'Agrega al menos un tratamiento antes de generar el PDF');
            setIsGeneratingPDF(false);
            return;
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
        const printWindow = window.open('', 'PresupuestoOdontologico', windowFeatures);

        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Presupuesto Odontológico - ${patient.nombres} ${patient.apellidos}</title>
          <meta charset="UTF-8">
          <style>
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            {
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
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0891b2;
            }
            
            .doctor-info {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            
            .logo-placeholder {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #06b6d4, #0891b2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20px;
              color: white;
              font-weight: bold;
              font-size: 24px;
            }
            
            .doctor-details h2 {
              color: #0891b2;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .doctor-details p {
              color: #64748b;
              font-size: 14px;
            }
            
            .budget-title {
              color: #374151;
              font-size: 28px;
              font-weight: 700;
              margin: 20px 0;
            }
            
            .patient-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
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
            
            .budget-table td {
              padding: 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            
            .budget-table tbody tr {
              background: white;
            }
            
            .budget-table tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            
            .budget-table tbody tr:hover {
              background: #e0f7fa;
            }
            
            .valor-cell {
              text-align: right;
              font-weight: 600;
              color: #059669;
            }
            
            .total-row {
              background: #f1f5f9 !important;
              font-weight: 700;
              font-size: 16px;
              border-top: 2px solid #0891b2;
            }
            
            .total-row .valor-cell {
              color: #0891b2;
              font-size: 18px;
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
              height: 80px;
              margin: 20px auto;
              display: block;
            }
            
            @media print {
              body { margin: 0; padding: 15px; }
              .budget-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `);

            printWindow.document.close();
            // Esperar a que cargue el contenido antes de imprimir
            printWindow.onload = () => {
                printWindow.focus(); // Enfocar la ventana emergente
                // Opción 1: Mostrar botones de acción
                printWindow.document.body.innerHTML += `
                <div style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px;">
                    <button onclick="window.print()" style="padding:8px 16px;background:#0891b2;color:white;border:none;border-radius:4px;cursor:pointer;">
                    Imprimir
                    </button>
                    <button onclick="window.close()" style="padding:8px 16px;background:#64748b;color:white;border:none;border-radius:4px;cursor:pointer;">
                    Cerrar
                    </button>
                </div>
                `;

                setIsGeneratingPDF(false);
                showNotification('success', 'Vista previa generada');
            };
            setTimeout(() => {
                //printWindow.print();
                //printWindow.close();
                setIsGeneratingPDF(false);
                showNotification('success', 'PDF generado exitosamente');
            }, 250);
        } else {
            setIsGeneratingPDF(false);
            showNotification('error', 'No se pudo abrir la ventana para imprimir');
        }
    };

    const currentDate = new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return (
        <div className="space-y-6">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <Calculator className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">Agregar Tratamiento</h3>
                            <p className="text-sm text-slate-500">Agrega tratamientos al presupuesto</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pieza</label>
                        <input
                            type="text"
                            value={newItem.pieza}
                            onChange={(e) => setNewItem({ ...newItem, pieza: e.target.value })}
                            placeholder="ej: 4.4, B.C, 2.6"
                            className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tratamiento</label>
                        <select
                            value={newItem.accion}
                            onChange={(e) => setNewItem({ ...newItem, accion: e.target.value })}
                            className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        >
                            <option value="">Seleccionar tratamiento</option>
                            {commonTreatments.map((treatment) => (
                                <option key={treatment} value={treatment}>{treatment}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={newItem.accion}
                            onChange={(e) => setNewItem({ ...newItem, accion: e.target.value })}
                            placeholder="O escriba un tratamiento personalizado"
                            className="w-full px-3 py-1 mt-2 border border-cyan-100 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-cyan-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor ($)</label>
                        <input
                            type="text"
                            value={newItem.valor}
                            onChange={(e) => handleValueChange(e.target.value, setNewItem, 'valor')}
                            placeholder="25.000"
                            className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddItem}
                            className="w-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl text-sm px-4 py-2.5 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-cyan-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-700">Tratamientos Agregados</h3>
                            <div className="flex items-center space-x-3">
                                <div className="text-sm text-slate-500">
                                    {items.length} tratamiento(s)
                                </div>
                                <button
                                    onClick={generatePDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm disabled:opacity-70"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 border-b border-cyan-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Pieza</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acción</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-cyan-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-cyan-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {isEditing === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editingItem.pieza}
                                                    onChange={(e) => setEditingItem({ ...editingItem, pieza: e.target.value })}
                                                    className="w-full px-2 py-1 border border-cyan-300 rounded text-sm"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-slate-700">{item.pieza}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editingItem.accion}
                                                    onChange={(e) => setEditingItem({ ...editingItem, accion: e.target.value })}
                                                    className="w-full px-2 py-1 border border-cyan-300 rounded text-sm"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-700">{item.accion}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isEditing === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editingItem.valor}
                                                    onChange={(e) => handleValueChange(e.target.value, setEditingItem, 'valor')}
                                                    className="w-full px-2 py-1 border border-cyan-300 rounded text-sm text-right"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(item.valor)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {isEditing === item.id ? (
                                                    <>
                                                        <button
                                                            onClick={saveEditing}
                                                            className="text-green-600 hover:text-green-800 transition-colors p-1"
                                                            title="Guardar cambios"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                                            title="Cancelar edición"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(item)}
                                                            className="text-cyan-600 hover:text-cyan-800 transition-colors p-1"
                                                            title="Editar tratamiento"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                            title="Eliminar tratamiento"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 border-t-2 border-cyan-500">
                                    <td className="px-6 py-4 font-semibold text-slate-700" colSpan={2}>
                                        TOTAL
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-lg font-bold text-cyan-600">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-12 text-center">
                    <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Sin tratamientos agregados</h3>
                    <p className="text-slate-500">Comienza agregando tratamientos para crear un presupuesto</p>
                </div>
            )}

            <div style={{ display: 'none' }}>
                <div ref={printRef} className="budget-container">
                    {/* Encabezado compacto manteniendo el estilo original */}
                    <div className="budget-header" style={{
                        marginBottom: '15px',
                        paddingBottom: '10px',
                        borderBottom: '2px solid #0891b2'
                    }}>
                        <div className="doctor-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <div className="doctor-details" style={{ textAlign: 'center' }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    marginBottom: '2px',
                                    color: '#0891b2'
                                }}>{doctorName}</h2>
                                <p style={{
                                    fontSize: '13px',
                                    margin: '2px 0',
                                    color: '#64748b'
                                }}>CIRUJANO DENTISTA</p>
                                <p style={{
                                    fontSize: '13px',
                                    margin: '2px 0',
                                    color: '#64748b'
                                }}>RUT: {doctorRut}</p>
                            </div>
                        </div>

                        <h1 className="budget-title" style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            textAlign: 'center',
                            margin: '10px 0',
                            color: '#374151'
                        }}>Presupuesto Odontológico</h1>

                        <div className="patient-info" style={{
                            background: '#f8fafc',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            borderLeft: '4px solid #0891b2'
                        }}>
                            <div className="patient-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px'
                            }}>
                                <div className="patient-field" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '13px' }}>Paciente:</strong>
                                    <span style={{ fontSize: '13px' }}>{patient.nombres} {patient.apellidos}</span>
                                </div>
                                <div className="patient-field" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '13px' }}>Contacto:</strong>
                                    <span style={{ fontSize: '13px' }}>{patient.telefono}</span>
                                </div>
                                <div className="patient-field" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '13px' }}>Rut:</strong>
                                    <span style={{ fontSize: '13px' }}>{patient.rut}</span>
                                </div>
                                <div className="patient-field" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '13px' }}>Fecha:</strong>
                                    <span style={{ fontSize: '13px' }}>{currentDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resto del contenido se mantiene igual */}
                    {items.length > 0 && (
                        <table className="budget-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>Piezas</th>
                                    <th style={{ width: '60%' }}>Acción</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.pieza}</td>
                                        <td>{item.accion}</td>
                                        <td className="valor-cell">{formatCurrency(item.valor)}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={2}><strong>Total</strong></td>
                                    <td className="valor-cell"><strong>{formatCurrency(calculateTotal())}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    <div className="footer-note">
                        *Queda sujeto a modificaciones
                    </div>

                    <div className="signature-section">
                        <img
                            src="/firmaDraCamila.png"
                            alt="Firma Dra. Camila"
                            className="signature-img"
                            style={{ height: '100px' }}
                        />
                        <div className="signature-line"></div>
                        <p><strong>{doctorName}</strong></p>
                        <p>RUT: {doctorRut}</p>
                    </div>

                    <div className="date-section">
                        <p>Fecha de emisión: {currentDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { BudgetComponent };