// src/presentation/pages/patient/tabs/prescriptions/PatientPrescriptions.tsx
import React, { useState } from 'react';
import { FileText, Plus, Trash2, Calendar, Eye } from 'lucide-react';
import { Patient } from '@/core/use-cases/patients';
import { usePrescriptions } from '@/presentation/hooks/prescriptions/usePrescriptions';
import { useLoginMutation, useProfile } from '@/presentation/hooks';
import { NewPrescriptionModal } from './modals/NewPrescriptionModal';
import { PrescriptionPDFGenerator } from './utils/pdf';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';

interface PatientPrescriptionsProps {
  patient: Patient;
}

export const PatientPrescriptions: React.FC<PatientPrescriptionsProps> = ({ patient }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const notification = useNotification();
  const confirmation = useConfirmation();
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  const {
    prescriptions,
    isLoading,
    savePrescription,
    deletePrescription,
    isSaving,
    isDeleting,
  } = usePrescriptions(patient.id);

  const handleSave = async (medications: string) => {
    try {
      const response = await savePrescription({
        patientId: patient.id,
        medications,
      });
      setShowNewModal(false);

      // Mostrar automáticamente la receta recién creada
      if (response?.prescription) {
        const doctorData = queryProfile.data ? {
          name: queryProfile.data.name || '',
          lastName: queryProfile.data.lastName || '',
          rut: queryProfile.data.rut || '',
          signature: queryProfile.data.signature || null,
          logo: queryProfile.data.logo || null,
          profession: queryProfile.data.profession || null,
          specialty: queryProfile.data.specialty || null
        } : undefined;

        await PrescriptionPDFGenerator.generatePrescriptionPDF(
          response.prescription,
          patient,
          doctorData
        );
      }
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleDelete = async (prescriptionId: number) => {
    const confirmed = await confirmation.confirm({
      title: 'Eliminar Receta',
      message: '¿Estás seguro de que deseas eliminar esta receta?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) {
      confirmation.close();
      return;
    }

    try {
      await deletePrescription(prescriptionId);
      confirmation.close();
    } catch (error) {
      confirmation.close();
    }
  };

  const handleViewPDF = async (prescriptionId: number) => {
    const prescription = prescriptions.find((p) => p.id === prescriptionId);
    if (!prescription) {
      notification.error('Receta no encontrada');
      return;
    }

    try {
      const doctorData = queryProfile.data ? {
        name: queryProfile.data.name || '',
        lastName: queryProfile.data.lastName || '',
        rut: queryProfile.data.rut || '',
        signature: queryProfile.data.signature || null,
        logo: queryProfile.data.logo || null,
        profession: queryProfile.data.profession || null,
        specialty: queryProfile.data.specialty || null
      } : undefined;

      await PrescriptionPDFGenerator.generatePrescriptionPDF(
        prescription,
        patient,
        doctorData
      );
    } catch (error: any) {
      notification.error(error.message || 'Error al visualizar PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
      />

      <NewPrescriptionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Recetas Médicas</h3>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona las recetas del paciente
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Receta</span>
          </button>
        </div>

        {/* Lista de recetas */}
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No hay recetas registradas
            </h3>
            <p className="text-slate-500 mb-6">
              Crea la primera receta médica para este paciente
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Receta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700">
                        Receta #{prescription.id}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(prescription.created_at).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPDF(prescription.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Receta"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prescription.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">
                    Indicaciones Médicas:
                  </h5>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">
                    {prescription.medications}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
