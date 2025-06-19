import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import * as UseCasesCreate from "@/core/use-cases/patients/create-patient.use-case";
import * as UseCasesUpdate from "@/core/use-cases/patients/update-patient.use-case";
import * as UseCasesDelete from "@/core/use-cases/patients/delete-patient.use-case";
import { useToast } from "../../context/ToastContext"

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (patientData: UseCasesCreate.CreatePatientDto) =>
      UseCasesCreate.createPatientUseCase(apiFetcher, patientData),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      success(
        "Paciente creado exitosamente",
        `${patient.nombres} ${patient.apellidos} ha sido agregado a tu lista de pacientes.`
      );
    },
    onError: (err: any) => {
      console.error("Error creating patient:", err);
      error(
        "Error al crear paciente",
        err.message || "Ocurrió un error inesperado al crear el paciente."
      );
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ patientId, patientData }: { 
      patientId: number; 
      patientData: UseCasesUpdate.UpdatePatientDto 
    }) => UseCasesUpdate.updatePatientUseCase(apiFetcher, patientId, patientData),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      success(
        "Paciente actualizado exitosamente",
        `Los datos de ${patient.nombres} ${patient.apellidos} han sido actualizados.`
      );
    },
    onError: (err: any) => {
      console.error("Error updating patient:", err);
      error(
        "Error al actualizar paciente",
        err.message || "Ocurrió un error inesperado al actualizar el paciente."
      );
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (patientId: number) =>
      UseCasesDelete.deletePatientUseCase(apiFetcher, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      success(
        "Paciente eliminado exitosamente",
        "El paciente ha sido removido de tu lista."
      );
    },
    onError: (err: any) => {
      console.error("Error deleting patient:", err);
      error(
        "Error al eliminar paciente",
        err.message || "Ocurrió un error inesperado al eliminar el paciente."
      );
    },
  });
};