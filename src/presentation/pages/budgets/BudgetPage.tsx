// src/presentation/pages/budget/BudgetPage.tsx - PÁGINA COMPLETA DE PRESUPUESTOS
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

// Hooks
import { useLoginMutation, useProfile, usePatients } from "@/presentation/hooks";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";

// Types y utilidades
import {
    BudgetItem,
    Budget,
    BUDGET_TYPE,
    BudgetUtils
} from "@/core/use-cases/budgets";
import { Patient } from "@/core/use-cases/patients";

// Componentes del editor (reutilizamos los existentes)
import { Notification } from '../patient/tabs/budget/components/Notification';
import { BudgetEditor } from '../patient/tabs/budget/components/BudgetEditor';
import { PDFGenerator } from '../patient/tabs/budget/utils/pdfGenerator';
import {
    BudgetFormData,
    BudgetFormUtils
} from '../patient/tabs/budget/types/budget.types';

const BudgetPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Obtener parámetros de la URL
    const preselectedPatientId = searchParams.get('patientId');
    const budgetId = searchParams.get('budgetId');
    const isReadonly = searchParams.get('readonly') === 'true';

    // Estados principales
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

    // Estados del formulario
    const [items, setItems] = useState<BudgetItem[]>([]);
    const [budgetType, setBudgetType] = useState<string>(BUDGET_TYPE.ODONTOLOGICO);
    const [newItem, setNewItem] = useState<BudgetFormData>({
        pieza: '',
        accion: '',
        valor: ''
    });
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<BudgetFormData>({
        pieza: '',
        accion: '',
        valor: ''
    });

    // Estados de UI
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Hooks para datos
    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');
    const { queryPatients } = usePatients();

    // Hook para presupuestos (se activa cuando hay paciente seleccionado)
    const {
        budgets,
        saveBudget,
        isLoadingSave,
    } = useMultipleBudgetOperations(selectedPatient?.id || 0);

    // ✅ CARGAR PACIENTES Y PRESUPUESTO INICIAL
    useEffect(() => {
        const patients = queryPatients.data?.patients || [];

        // Si hay un paciente preseleccionado, cargarlo
        if (preselectedPatientId && patients.length > 0) {
            const patient = patients.find(p => p.id === parseInt(preselectedPatientId));
            if (patient) {
                setSelectedPatient(patient);
            }
        }
    }, [preselectedPatientId, queryPatients.data]);

    // ✅ CARGAR PRESUPUESTO ESPECÍFICO
    useEffect(() => {
        if (budgetId && budgets.length > 0) {
            const budget = budgets.find(b => b.id === parseInt(budgetId));
            if (budget) {
                setSelectedBudget(budget);
                setItems(budget.items.map(item => ({
                    ...item,
                    valor: parseFloat(item.valor.toString())
                })));
                setBudgetType(budget.budget_type);
            }
        }
    }, [budgetId, budgets]);

    // ✅ FUNCIONES DE UTILIDAD
    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const markAsChanged = () => setHasUnsavedChanges(true);

    const handlePatientChange = (patientId: string) => {
        const patients = queryPatients.data?.patients || [];
        const patient = patients.find(p => p.id === parseInt(patientId));
        setSelectedPatient(patient || null);

        // Resetear formulario al cambiar paciente
        setSelectedBudget(null);
        setItems([]);
        setBudgetType(BUDGET_TYPE.ODONTOLOGICO);
        setHasUnsavedChanges(false);
    };

    const handleBackToPatient = () => {
        if (hasUnsavedChanges) {
            if (!window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                return;
            }
        }

        if (selectedPatient) {
            navigate(`/patient/${selectedPatient.id}?tab=budget`);
        } else {
            navigate('/patients');
        }
    };

    // ✅ FUNCIONES DEL EDITOR (igual que antes)
    const handleAddItem = () => {
        const validation = BudgetFormUtils.validateItem(newItem);
        if (validation) {
            showNotification('error', validation);
            return;
        }

        const valor = BudgetFormUtils.parseValue(newItem.valor);
        const item: BudgetItem = {
            pieza: newItem.pieza,
            accion: newItem.accion,
            valor: valor,
            orden: items.length
        };

        setItems([...items, item]);
        setNewItem({ pieza: '', accion: '', valor: '' });
        markAsChanged();
        showNotification('success', 'Tratamiento agregado exitosamente');
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        markAsChanged();
        showNotification('success', 'Tratamiento eliminado');
    };

    const handleStartEditing = (index: number) => {
        const item = items[index];
        setIsEditing(index.toString());
        setEditingItem({
            pieza: item.pieza || '',
            accion: item.accion,
            valor: item.valor.toString()
        });
    };

    const handleCancelEditing = () => {
        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
    };

    const handleSaveEditing = () => {
        const validation = BudgetFormUtils.validateItem(editingItem);
        if (validation) {
            showNotification('error', validation);
            return;
        }

        const index = parseInt(isEditing!);
        const valor = BudgetFormUtils.parseValue(editingItem.valor);

        setItems(items.map((item, i) =>
            i === index
                ? {
                    ...item,
                    pieza: editingItem.pieza,
                    accion: editingItem.accion,
                    valor: valor
                }
                : item
        ));

        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
        markAsChanged();
        showNotification('success', 'Tratamiento actualizado');
    };

    const handleBudgetTypeChange = (type: string) => {
        setBudgetType(type);
        markAsChanged();
    };

    const handleSaveBudget = async () => {
        if (!selectedPatient) {
            showNotification('error', 'Debes seleccionar un paciente');
            return;
        }

        if (!items || items.length === 0) {
            showNotification('error', 'Agrega al menos un tratamiento antes de guardar');
            return;
        }

        try {
            const formattedItems = items.map((item, index) => {
                const formattedItem: any = {
                    pieza: item.pieza || '',
                    accion: item.accion || '',
                    valor: Number(item.valor) || 0,
                    orden: index
                };

                if (item.id && typeof item.id === 'number' && item.id > 0) {
                    formattedItem.id = item.id;
                }

                return formattedItem;
            });

            const budgetData = {
                patientId: selectedPatient.id,
                budgetType,
                items: formattedItems
            };

            await saveBudget(budgetData);
            setHasUnsavedChanges(false);
            showNotification('success', 'Presupuesto guardado exitosamente');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido al guardar';
            showNotification('error', `Error al guardar: ${errorMessage}`);
        }
    };

    const handleNewItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        setNewItem(prev => ({ ...prev, [field]: value }));
    };

    const handleEditingItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    const handleExportPDF = async () => {
        if (!selectedPatient) {
            showNotification('error', 'Debes seleccionar un paciente');
            return;
        }

        if (items.length === 0) {
            showNotification('error', 'No hay tratamientos para exportar');
            return;
        }

        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature
            } : undefined;

            // Crear objeto temporal del presupuesto para PDF
            const tempBudget: Budget = selectedBudget || {
                id: 0,
                patient_id: selectedPatient.id,
                user_id: 0,
                total_amount: BudgetFormUtils.calculateTotal(items).toString(),
                status: 'borrador',
                budget_type: budgetType,
                created_at: new Date().toISOString(),
                updated_at: null,
                items: items.map(item => ({
                    ...item,
                    valor: typeof item.valor === 'string' ? parseFloat(item.valor) : item.valor
                }))
            };

            await PDFGenerator.generateBudgetPDF(tempBudget, selectedPatient, doctorData);
            showNotification('success', 'PDF generado exitosamente');

        } catch (error: any) {
            const errorMessage = error.message || 'Error al generar PDF';
            showNotification('error', errorMessage);
        }
    };

    // Loading states
    if (queryPatients.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="bg-white rounded-xl p-6">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const patients = queryPatients.data?.patients || [];
    const canEdit = !isReadonly && (!selectedBudget || BudgetUtils.canModify(selectedBudget));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Notifications */}
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}

                {/* Selector de paciente */}
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <Users className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Seleccionar Paciente *
                            </label>
                            <select
                                value={selectedPatient?.id || ''}
                                onChange={(e) => handlePatientChange(e.target.value)}
                                disabled={!canEdit} // 🔁 Aquí está el cambio
                                className="w-full max-w-md px-4 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona un paciente...</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.nombres} {patient.apellidos} - {patient.rut}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {selectedPatient && (
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Paciente seleccionado:</p>
                                <p className="font-medium text-slate-700">
                                    {selectedPatient.nombres} {selectedPatient.apellidos}
                                </p>
                                <p className="text-sm text-slate-500">{selectedPatient.telefono}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor de presupuesto */}
                {selectedPatient ? (
                    <BudgetEditor
                        patient={selectedPatient}
                        budget={selectedBudget}
                        items={items}
                        budgetType={budgetType}
                        newItem={newItem}
                        editingItem={editingItem}
                        isEditing={isEditing}
                        hasUnsavedChanges={hasUnsavedChanges}
                        isLoadingSave={isLoadingSave}
                        onBack={handleBackToPatient}
                        onSave={handleSaveBudget}
                        onBudgetTypeChange={handleBudgetTypeChange}
                        onAddItem={handleAddItem}
                        onDeleteItem={handleDeleteItem}
                        onStartEditing={handleStartEditing}
                        onCancelEditing={handleCancelEditing}
                        onSaveEditing={handleSaveEditing}
                        onNewItemChange={handleNewItemChange}
                        onEditingItemChange={handleEditingItemChange}
                        onExportPDF={handleExportPDF}
                    />
                ) : (
                    /* Estado sin paciente seleccionado */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Selecciona un Paciente
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Para crear o editar un presupuesto, primero debes seleccionar un paciente de la lista.
                        </p>
                        <div className="text-sm text-gray-400">
                            {patients.length > 0
                                ? `${patients.length} pacientes disponibles`
                                : 'No hay pacientes registrados'
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetPage;