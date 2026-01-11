import { useState, useEffect } from "react";
import {
  Save,
  ChevronRight,
  User,
  X,
} from "lucide-react";
import { formatRut } from "@/config/helpers";

// Interfaces
interface PatientFormData {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  alergias: string;
  medicamentos_actuales: string;
  enfermedades_cronicas: string;
  cirugias_previas: string;
  hospitalizaciones_previas: string;
  notas_medicas: string;
}

interface Patient {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  alergias: string;
  medicamentos_actuales: string;
  enfermedades_cronicas: string;
  cirugias_previas: string;
  hospitalizaciones_previas: string;
  notas_medicas: string;
  id_doctor: number;
  createdat: string;
  updatedat: string;
  isactive: boolean;
}

interface EditPatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSubmit: (patientId: number, formData: PatientFormData) => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ 
  isOpen, 
  patient, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    rut: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    alergias: "",
    medicamentos_actuales: "",
    enfermedades_cronicas: "",
    cirugias_previas: "",
    hospitalizaciones_previas: "",
    notas_medicas: "",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (isOpen && patient) {
      setFormData({
        rut: patient.rut,
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fecha_nacimiento: patient.fecha_nacimiento,
        telefono: patient.telefono,
        email: patient.email,
        direccion: patient.direccion,
        ciudad: patient.ciudad,
        codigo_postal: patient.codigo_postal,
        alergias: patient.alergias,
        medicamentos_actuales: patient.medicamentos_actuales,
        enfermedades_cronicas: patient.enfermedades_cronicas,
        cirugias_previas: patient.cirugias_previas,
        hospitalizaciones_previas: patient.hospitalizaciones_previas,
        notas_medicas: patient.notas_medicas,
      });
    }
  }, [isOpen, patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si el campo es RUT, formatear automáticamente
    const finalValue = name === 'rut' ? formatRut(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.rut.trim()) errors.rut = 'RUT es requerido';
    if (!formData.nombres.trim()) errors.nombres = 'Nombres es requerido';
    if (!formData.apellidos.trim()) errors.apellidos = 'Apellidos es requerido';
    if (!formData.fecha_nacimiento) errors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
    if (!formData.telefono.trim()) errors.telefono = 'Teléfono es requerido';
    if (!formData.email.trim()) errors.email = 'Email es requerido';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email no es válido';
    }
    
    if (formData.rut && !/^\d{7,8}-[\dkK]$/.test(formData.rut)) {
      errors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.direccion.trim()) errors.direccion = 'Dirección es requerida';
    if (!formData.ciudad.trim()) errors.ciudad = 'Ciudad es requerida';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = () => {
    if (patient) {
      onSubmit(patient.id, formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormErrors({});
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen || !patient) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-2xl">
            {/* Header - Estándar */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Editar Paciente
                  </h3>
                  <p className="text-xs sm:text-sm text-white text-opacity-90 mt-0.5">
                    Paso {currentStep} de 3 - {
                      currentStep === 1 ? 'Información Personal' :
                      currentStep === 2 ? 'Ubicación' : 'Información Médica'
                    }
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1 sm:flex-none">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      step <= currentStep ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                        step < currentStep ? 'bg-cyan-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form content */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                Información Personal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RUT *</label>
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                    placeholder="12345678-9"
                    maxLength={10}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.rut ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.rut && <p className="text-red-600 text-xs mt-1">{formErrors.rut}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Juan Carlos"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.nombres ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.nombres && <p className="text-red-600 text-xs mt-1">{formErrors.nombres}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="González López"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.apellidos ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.apellidos && <p className="text-red-600 text-xs mt-1">{formErrors.apellidos}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.fecha_nacimiento ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.fecha_nacimiento && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_nacimiento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+56912345678"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.telefono ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.telefono && <p className="text-red-600 text-xs mt-1">{formErrors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="juan@email.com"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                Ubicación
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Av. Las Condes 1234"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.direccion ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.direccion && <p className="text-red-600 text-xs mt-1">{formErrors.direccion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Santiago"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 transition-all ${
                      formErrors.ciudad ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  {formErrors.ciudad && <p className="text-red-600 text-xs mt-1">{formErrors.ciudad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleInputChange}
                    placeholder="7550000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                Información Médica
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alergias</label>
                  <textarea
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleInputChange}
                    placeholder="Penicilina, polen, mariscos..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medicamentos Actuales</label>
                  <textarea
                    name="medicamentos_actuales"
                    value={formData.medicamentos_actuales}
                    onChange={handleInputChange}
                    placeholder="Omeprazol 20mg (diario)..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enfermedades Crónicas</label>
                  <textarea
                    name="enfermedades_cronicas"
                    value={formData.enfermedades_cronicas}
                    onChange={handleInputChange}
                    placeholder="Diabetes, hipertensión..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cirugías Previas</label>
                  <textarea
                    name="cirugias_previas"
                    value={formData.cirugias_previas}
                    onChange={handleInputChange}
                    placeholder="Apendicectomía (2020)..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hospitalizaciones Previas</label>
                  <textarea
                    name="hospitalizaciones_previas"
                    value={formData.hospitalizaciones_previas}
                    onChange={handleInputChange}
                    placeholder="Neumonía (2018) - 5 días..."
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas Médicas</label>
                  <textarea
                    name="notas_medicas"
                    value={formData.notas_medicas}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales del paciente..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 border-slate-300 hover:border-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 bg-slate-50">
              <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                  >
                    Anterior
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span>Guardar Cambios</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { EditPatientModal };
export type { PatientFormData, EditPatientModalProps };