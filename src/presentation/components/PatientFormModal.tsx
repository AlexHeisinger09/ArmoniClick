import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, UserPlus, AlertCircle, Check } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { patientSchema, PatientFormData } from '../validations/patientSchema';
import { useCreatePatient, useUpdatePatient } from '../hooks/patients/usePatientMutations';
import { Patient } from '@/core/entities/patient.entity';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null; // Si existe, es edición; si no, es creación
  onSuccess?: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const isEditing = !!patient;

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      rut: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      codigoPostal: '',
    },
  });

  // Cargar datos del paciente si es edición
  useEffect(() => {
    if (isEditing && patient) {
      form.reset({
        rut: patient.rut,
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fechaNacimiento: patient.fechaNacimiento,
        telefono: patient.telefono || '',
        email: patient.email || '',
        direccion: patient.direccion || '',
        ciudad: patient.ciudad || '',
        codigoPostal: patient.codigoPostal || '',
      });
    } else {
      form.reset();
    }
  }, [isEditing, patient, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing && patient) {
        await updatePatientMutation.mutateAsync({
          patientId: patient.id,
          patientData: data
        });
        setSuccessMessage('Paciente actualizado exitosamente');
      } else {
        await createPatientMutation.mutateAsync(data);
        setSuccessMessage('Paciente creado exitosamente');
      }

      setTimeout(() => {
        setSuccessMessage('');
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error al guardar paciente:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = createPatientMutation.isPending || updatePatientMutation.isPending;
  const error = createPatientMutation.error || updatePatientMutation.error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-aesthetic-gris-profundo flex items-center">
            <UserPlus className="w-6 h-6 mr-2" />
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h3>
          <button
            onClick={handleClose}
            className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <Check className="w-5 h-5" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription>
              {error.message || 'Ocurrió un error inesperado'}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      RUT *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="12345678-9"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Fecha de Nacimiento *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Nombres *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Juan Carlos"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Apellidos *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Pérez González"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+56912345678"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="ejemplo@email.com"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Ciudad
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Santiago"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoPostal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-aesthetic-gris-profundo font-medium">
                      Código Postal
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="7550000"
                        className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-aesthetic-gris-profundo font-medium">
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Av. Las Condes 1234"
                      className="border-aesthetic-lavanda/30 focus:ring-aesthetic-lavanda"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-6 border-t border-aesthetic-lavanda/20">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="border-aesthetic-lavanda/30 text-aesthetic-gris-profundo hover:bg-aesthetic-lavanda/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aesthetic-gris-profundo mr-2"></div>
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Actualizar' : 'Crear'} Paciente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};