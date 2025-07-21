import { useState, useEffect } from "react";
import {
  Save,
  ChevronRight,
  User,
  X,
} from "lucide-react";

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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <User className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-700">
                Editar Paciente
              </h3>
              <p className="text-sm text-slate-500">
                Paso {currentStep} de 3 - {
                  currentStep === 1 ? 'Información Personal' :
                  currentStep === 2 ? 'Ubicación' : 'Información Médica'
                }
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-amber-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-amber-200">
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.rut ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.nombres ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.apellidos ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.fecha_nacimiento ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.telefono ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.email ? 'border-red-300' : 'border-amber-200'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-amber-200">
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.direccion ? 'border-red-300' : 'border-amber-200'
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
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 ${
                      formErrors.ciudad ? 'border-red-300' : 'border-amber-200'
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-amber-200">
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
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
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-t border-amber-200 bg-slate-50 space-y-3 sm:space-y-0">
          <div className="text-sm text-slate-500">* Campos obligatorios</div>
          <div className="flex space-x-3 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-6 py-2.5 transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-6 py-2.5 transition-colors"
            >
              Cancelar
            </button>
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { EditPatientModal };
export type { PatientFormData, EditPatientModalProps };