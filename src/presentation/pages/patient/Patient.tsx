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
}import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Clock,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  Pill,
  AlertTriangle,
  X,
  AlertCircle,
  Info
} from "lucide-react";
import { useProfile, useLoginMutation } from "@/presentation/hooks";

// Interfaz actualizada según la tabla real de la base de datos
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

interface Treatment {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'activo' | 'completado' | 'pausado';
  descripcion: string;
}

interface Appointment {
  id: number;
  fecha: string;
  hora: string;
  tipo: string;
  estado: 'programada' | 'completada' | 'cancelada';
  notas?: string;
}

interface MedicalRecord {
  fecha: string;
  tipo: string;
  descripcion: string;
  medico: string;
}

interface PatientProps {
  doctorId?: number;
}

// Datos iniciales para el formulario de nuevo paciente
const initialFormData: PatientFormData = {
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
};

// Datos de ejemplo para tratamientos, citas y ficha médica
const mockTreatments: Treatment[] = [
  {
    id: 1,
    nombre: "Fisioterapia Rehabilitación",
    fecha_inicio: "2024-01-15",
    fecha_fin: "2024-03-15",
    estado: 'completado',
    descripcion: "Tratamiento de rehabilitación post-operatoria"
  },
  {
    id: 2,
    nombre: "Terapia Ocupacional",
    fecha_inicio: "2024-02-01",
    estado: 'activo',
    descripcion: "Mejora de habilidades motoras finas"
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    fecha: "2024-06-20",
    hora: "10:00",
    tipo: "Consulta de seguimiento",
    estado: 'programada'
  },
  {
    id: 2,
    fecha: "2024-06-15",
    hora: "14:30",
    tipo: "Evaluación fisioterapia",
    estado: 'completada',
    notas: "Paciente muestra buena evolución"
  },
  {
    id: 3,
    fecha: "2024-06-25",
    hora: "09:00",
    tipo: "Control médico",
    estado: 'programada'
  }
];

const mockMedicalRecords: MedicalRecord[] = [
  {
    fecha: "2024-06-10",
    tipo: "Consulta",
    descripcion: "Control rutinario. Paciente presenta evolución favorable.",
    medico: "Dr. García"
  },
  {
    fecha: "2024-05-15",
    tipo: "Examen",
    descripcion: "Radiografía de rodilla. Sin anomalías detectadas.",
    medico: "Dr. Martínez"
  },
  {
    fecha: "2024-04-20",
    tipo: "Tratamiento",
    descripcion: "Inicio de fisioterapia post-operatoria.",
    medico: "Dr. López"
  }
];

// Componente de animación médica para pacientes
const PatientsAnimation: React.FC = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center justify-center">
      <Heart
        className="w-12 h-12 text-red-500 animate-pulse"
        style={{
          animation: 'pulse 2s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>
    <div className="absolute top-0 right-1">
      <Stethoscope
        className="w-6 h-6 text-cyan-600 animate-bounce"
        style={{
          animation: 'bounce 3s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>
    <div className="absolute bottom-1 left-1">
      <Activity
        className="w-5 h-5 text-green-500"
        style={{
          animation: 'pulse 1.5s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>
    <div className="absolute top-2 left-3">
      <Pill
        className="w-4 h-4 text-blue-500 animate-spin"
        style={{
          animation: 'spin 4s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>
    <div className="absolute inset-0">
      <div className="absolute top-3 right-4 w-1 h-1 bg-red-400 rounded-full animate-ping"
        style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-6 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
        style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-4 right-3 w-1 h-1 bg-green-400 rounded-full animate-ping"
        style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-6 left-5 w-1 h-1 bg-blue-400 rounded-full animate-ping"
        style={{ animationDelay: '0.5s' }}></div>
    </div>
  </div>
);

// Componente para mostrar el detalle completo del paciente
const PatientDetail: React.FC<{
  patient: Patient;
  onBack: () => void;
}> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState('informacion');

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
      case 'programada':
        return 'bg-green-100 text-green-800';
      case 'completado':
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'informacion', label: 'Información', icon: User },
    { id: 'tratamientos', label: 'Tratamientos', icon: Stethoscope },
    { id: 'citas', label: 'Citas Agendadas', icon: Clock },
    { id: 'historial', label: 'Historial Médico', icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacion':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    {patient.nombres} {patient.apellidos}
                  </h2>
                  <p className="text-slate-500">RUT: {patient.rut}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Paciente
                  </button>
                  <div className="bg-cyan-100 p-3 rounded-full">
                    <User className="w-8 h-8 text-cyan-600" />
                  </div>
                </div>
              </div>

              {/* Información médica */}
              <div className="mt-6 pt-6 border-t border-cyan-200">
                <h4 className="font-semibold text-slate-700 mb-4">Información Médica</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patient.medicamentos_actuales && (
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">Medicamentos Actuales</p>
                      <p className="text-sm text-slate-700">{patient.medicamentos_actuales}</p>
                    </div>
                  )}

                  {patient.enfermedades_cronicas && (
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">Enfermedades Crónicas</p>
                      <p className="text-sm text-slate-700">{patient.enfermedades_cronicas}</p>
                    </div>
                  )}

                  {patient.cirugias_previas && (
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">Cirugías Previas</p>
                      <p className="text-sm text-slate-700">{patient.cirugias_previas}</p>
                    </div>
                  )}

                  {patient.hospitalizaciones_previas && (
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">Hospitalizaciones Previas</p>
                      <p className="text-sm text-slate-700">{patient.hospitalizaciones_previas}</p>
                    </div>
                  )}
                </div>

                {patient.notas_medicas && (
                  <div className="mt-4 pt-4 border-t border-cyan-100">
                    <p className="text-sm text-slate-500 font-medium mb-2">Notas Médicas</p>
                    <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg">{patient.notas_medicas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'tratamientos':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-700">
                Tratamientos del Paciente
              </h3>
              <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tratamiento
              </button>
            </div>

            <div className="space-y-4">
              {mockTreatments.map((treatment) => (
                <div key={treatment.id} className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-slate-700 text-lg">
                      {treatment.nombre}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(treatment.estado)}`}>
                      {treatment.estado}
                    </span>
                  </div>
                  <p className="text-slate-500 mb-3">
                    {treatment.descripcion}
                  </p>
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Inicio: {formatDate(treatment.fecha_inicio)}
                    {treatment.fecha_fin && (
                      <span className="ml-4">
                        • Fin: {formatDate(treatment.fecha_fin)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'citas':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-700">
                Citas Programadas
              </h3>
              <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </button>
            </div>

            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-700 text-lg">
                        {appointment.tipo}
                      </h4>
                      <div className="flex items-center text-slate-500 mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(appointment.fecha)} • {appointment.hora}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                      {appointment.estado}
                    </span>
                  </div>
                  {appointment.notas && (
                    <p className="text-slate-500 mb-3">
                      {appointment.notas}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'historial':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-700">
                Historial Médico
              </h3>
              <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Registro
              </button>
            </div>

            <div className="space-y-4">
              {mockMedicalRecords.map((record, index) => (
                <div key={index} className="border-l-4 border-cyan-500 pl-4 py-4 hover:bg-cyan-50 transition-colors rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium text-slate-700">
                        {record.tipo}
                      </span>
                      <span className="text-sm text-slate-500">
                        • {record.medico}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatDate(record.fecha)}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    {record.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const alertConfig = getAlertConfig();

  return (
    <div className="space-y-6">
      {/* Encabezado con botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-cyan-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a la lista
        </button>
      </div>

      {/* Pestañas de navegación */}
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
        <div className="border-b border-cyan-200">
          <nav className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-cyan-500 text-slate-700 bg-cyan-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-cyan-25'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal de Nuevo Paciente */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-700">
                Agregar Nuevo Paciente
              </h3>
              <button
                onClick={handleCloseNewPatientModal}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200">
                  Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      RUT *
                    </label>
                    <input
                      type="text"
                      name="rut"
                      value={newPatientForm.rut}
                      onChange={handleFormChange}
                      placeholder="12345678-9"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.rut ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.rut && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.rut}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={newPatientForm.nombres}
                      onChange={handleFormChange}
                      placeholder="Juan Carlos"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.nombres ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.nombres && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.nombres}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={newPatientForm.apellidos}
                      onChange={handleFormChange}
                      placeholder="González López"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.apellidos ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.apellidos && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.apellidos}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={newPatientForm.fecha_nacimiento}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.fecha_nacimiento ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.fecha_nacimiento && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.fecha_nacimiento}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={newPatientForm.telefono}
                      onChange={handleFormChange}
                      placeholder="+56912345678"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.telefono ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.telefono && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.telefono}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newPatientForm.email}
                      onChange={handleFormChange}
                      placeholder="juan@email.com"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.email ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Ubicación */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200">
                  Ubicación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={newPatientForm.direccion}
                      onChange={handleFormChange}
                      placeholder="Av. Las Condes 1234"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.direccion ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.direccion && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.direccion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={newPatientForm.ciudad}
                      onChange={handleFormChange}
                      placeholder="Santiago"
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.ciudad ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.ciudad && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.ciudad}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="codigo_postal"
                      value={newPatientForm.codigo_postal}
                      onChange={handleFormChange}
                      placeholder="7550000"
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200">
                  Información Médica
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Alergias
                    </label>
                    <textarea
                      name="alergias"
                      value={newPatientForm.alergias}
                      onChange={handleFormChange}
                      placeholder="Penicilina, polen, mariscos..."
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Medicamentos Actuales
                    </label>
                    <textarea
                      name="medicamentos_actuales"
                      value={newPatientForm.medicamentos_actuales}
                      onChange={handleFormChange}
                      placeholder="Omeprazol 20mg (diario)..."
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Enfermedades Crónicas
                    </label>
                    <textarea
                      name="enfermedades_cronicas"
                      value={newPatientForm.enfermedades_cronicas}
                      onChange={handleFormChange}
                      placeholder="Diabetes, hipertensión..."
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cirugías Previas
                    </label>
                    <textarea
                      name="cirugias_previas"
                      value={newPatientForm.cirugias_previas}
                      onChange={handleFormChange}
                      placeholder="Apendicectomía (2020)..."
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hospitalizaciones Previas
                    </label>
                    <textarea
                      name="hospitalizaciones_previas"
                      value={newPatientForm.hospitalizaciones_previas}
                      onChange={handleFormChange}
                      placeholder="Neumonía (2018) - 5 días..."
                      rows={2}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notas Médicas
                    </label>
                    <textarea
                      name="notas_medicas"
                      value={newPatientForm.notas_medicas}
                      onChange={handleFormChange}
                      placeholder="Observaciones adicionales del paciente..."
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-cyan-200">
                <button
                  type="button"
                  onClick={handleCloseNewPatientModal}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-6 py-2.5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNewPatient}
                  className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal Patient
const Patient: React.FC<PatientProps> = ({ doctorId = 1 }) => {
  // Estados principales
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchRut, setSearchRut] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  // Estados para vista
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Estados para modal de nuevo paciente
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState<PatientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Datos de ejemplo adaptados a la tabla real de la base de datos
  const mockPatients: Patient[] = [
    {
      id: 1,
      rut: "12345678-9",
      nombres: "Alex",
      apellidos: "Heisinger Vivanco",
      fecha_nacimiento: "1985-03-15",
      telefono: "+56912345678",
      email: "heisinger.vivanco@gmail.com",
      direccion: "Av. Las Condes 1234",
      ciudad: "Santiago",
      codigo_postal: "7550000",
      alergias: "Penicilina, Polen",
      medicamentos_actuales: "Omeprazol 20mg (diario), Losartán 50mg (diario)",
      enfermedades_cronicas: "Hipertensión arterial",
      cirugias_previas: "Apendicectomía (2010)",
      hospitalizaciones_previas: "Neumonía (2018) - 5 días",
      notas_medicas: "Paciente colaborador, sigue tratamiento correctamente. Control cada 3 meses.",
      id_doctor: 1,
      createdat: "2024-01-15T10:30:00.000Z",
      updatedat: "2024-06-10T14:20:00.000Z",
      isactive: true,
    },
    {
      id: 2,
      rut: "87654321-0",
      nombres: "María Fernanda",
      apellidos: "López Silva",
      fecha_nacimiento: "1990-07-22",
      telefono: "+56987654321",
      email: "maria.lopez@email.com",
      direccion: "Calle Principal 567",
      ciudad: "Providencia",
      codigo_postal: "7500000",
      alergias: "Sin alergias conocidas",
      medicamentos_actuales: "Levotiroxina 75mcg (en ayunas)",
      enfermedades_cronicas: "Hipotiroidismo",
      cirugias_previas: "Cesárea (2020)",
      hospitalizaciones_previas: "Parto por cesárea (2020) - 3 días",
      notas_medicas: "Paciente con buen control hormonal. Controles anuales de TSH.",
      id_doctor: 1,
      createdat: "2024-02-20T09:15:00.000Z",
      updatedat: "2024-05-25T16:45:00.000Z",
      isactive: true,
    },
    {
      id: 3,
      rut: "11223344-5",
      nombres: "Pedro Antonio",
      apellidos: "Martínez Rojas",
      fecha_nacimiento: "1978-12-03",
      telefono: "+56911223344",
      email: "pedro.martinez@email.com",
      direccion: "Pasaje Los Rosales 890",
      ciudad: "Las Condes",
      codigo_postal: "7550000",
      alergias: "Mariscos, Ibuprofeno",
      medicamentos_actuales: "Metformina 850mg (2 veces al día), Atorvastatina 20mg (nocturno)",
      enfermedades_cronicas: "Diabetes Mellitus tipo 2, Dislipidemia",
      cirugias_previas: "Colecistectomía laparoscópica (2015)",
      hospitalizaciones_previas: "Infarto agudo al miocardio (2019) - 7 días, Colecistectomía (2015) - 2 días",
      notas_medicas: "Paciente de alto riesgo cardiovascular. Requiere controles estrictos cada 2 meses. Dieta y ejercicio supervisado.",
      id_doctor: 1,
      createdat: "2024-03-10T11:20:00.000Z",
      updatedat: "2024-06-15T10:30:00.000Z",
      isactive: true,
    },
    {
      id: 4,
      rut: "99887766-K",
      nombres: "Ana Sofía",
      apellidos: "García Muñoz",
      fecha_nacimiento: "1992-05-18",
      telefono: "+56999887766",
      email: "ana.garcia@email.com",
      direccion: "Av. Libertador 2345",
      ciudad: "Vitacura",
      codigo_postal: "7630000",
      alergias: "Sin alergias conocidas",
      medicamentos_actuales: "Anticonceptivos orales, Vitamina D 1000UI",
      enfermedades_cronicas: "Sin enfermedades crónicas",
      cirugias_previas: "Sin cirugías previas",
      hospitalizaciones_previas: "Sin hospitalizaciones previas",
      notas_medicas: "Paciente joven y sana. Controles ginecológicos anuales. Última citología normal (2024).",
      id_doctor: 1,
      createdat: "2024-04-05T14:10:00.000Z",
      updatedat: "2024-06-01T09:25:00.000Z",
      isactive: true,
    },
  ];

  // Efectos
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      // Simulando delay de red
      setTimeout(() => {
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
        setLoading(false);
      }, 1000);
    };

    fetchPatients();
  }, [doctorId]);

  // Filtrar pacientes por nombre
  useEffect(() => {
    if (searchRut.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(searchRut.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchRut, patients]);

  // Funciones utilitarias
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Manejadores de eventos
  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedPatient(null);
  };

  // Manejadores para el modal de nuevo paciente
  const handleNewPatient = () => {
    setShowNewPatientModal(true);
  };

  const handleCloseNewPatientModal = () => {
    setShowNewPatientModal(false);
    setNewPatientForm(initialFormData);
    setFormErrors({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo si existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Campos requeridos
    if (!newPatientForm.rut.trim()) errors.rut = 'RUT es requerido';
    if (!newPatientForm.nombres.trim()) errors.nombres = 'Nombres es requerido';
    if (!newPatientForm.apellidos.trim()) errors.apellidos = 'Apellidos es requerido';
    if (!newPatientForm.fecha_nacimiento) errors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
    if (!newPatientForm.telefono.trim()) errors.telefono = 'Teléfono es requerido';
    if (!newPatientForm.email.trim()) errors.email = 'Email es requerido';
    if (!newPatientForm.direccion.trim()) errors.direccion = 'Dirección es requerida';
    if (!newPatientForm.ciudad.trim()) errors.ciudad = 'Ciudad es requerida';

    // Validación de email
    if (newPatientForm.email && !/\S+@\S+\.\S+/.test(newPatientForm.email)) {
      errors.email = 'Email no es válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewPatient = () => {
    if (!validateForm()) return;

    // Crear nuevo paciente
    const newPatient: Patient = {
      id: Math.max(...patients.map(p => p.id)) + 1,
      ...newPatientForm,
      id_doctor: doctorId,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      isactive: true,
    };

    // Agregar a la lista
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    setFilteredPatients(updatedPatients);

    // Cerrar modal y limpiar formulario
    handleCloseNewPatientModal();
  };

  // Render condicional para loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Barra de búsqueda y acciones - SIEMPRE VISIBLE */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <PatientsAnimation />
            <div className="flex-1">
              <h3 className="font-medium text-slate-700 sm:text-lg">
                {currentView === 'grid' ? 'Gestión de Pacientes' : `Paciente: ${selectedPatient?.nombres} ${selectedPatient?.apellidos}`}
              </h3>
              <p className="mt-0.5 text-slate-500">
                {currentView === 'grid'
                  ? `Bienvenido/a al módulo de gestión de pacientes. Buscar pacientes por RUT para acceder rápidamente a su informacion, tratamientos y ficha médica.
                     Registrar nuevos pacientes con todos sus datos clínicos relevantes`
                  : 'Vista detallada con tratamientos, citas y historial médico completo.'
                }
              </p>
              
              {/* Cuadros de alertas médicas - Solo en vista de detalle */}
              {currentView === 'detail' && selectedPatient && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {/* Cuadro de Alergias */}
                  <div className={`px-4 py-2 rounded-lg border-2 ${
                    selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas" 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-green-300 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas" ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Heart className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${
                          selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas" 
                            ? 'text-red-700' 
                            : 'text-green-700'
                        }`}>
                          Alergias
                        </p>
                        <p className={`text-sm ${
                          selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas" 
                            ? 'text-red-800' 
                            : 'text-green-800'
                        }`}>
                          {selectedPatient.alergias || "Sin alergias"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cuadro de Enfermedades Crónicas */}
                  <div className={`px-4 py-2 rounded-lg border-2 ${
                    selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas" 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-green-300 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas" ? (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Stethoscope className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${
                          selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas" 
                            ? 'text-orange-700' 
                            : 'text-green-700'
                        }`}>
                          Enfermedades Crónicas
                        </p>
                        <p className={`text-sm ${
                          selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas" 
                            ? 'text-orange-800' 
                            : 'text-green-800'
                        }`}>
                          {selectedPatient.enfermedades_cronicas || "Sin enfermedades"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cuadro de Notas Médicas */}
                  {selectedPatient.notas_medicas && (
                    <div className="px-4 py-2 rounded-lg border-2 border-blue-300 bg-blue-50">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-blue-700">
                            Notas Médicas
                          </p>
                          <p className="text-sm text-blue-800 max-w-xs truncate">
                            {selectedPatient.notas_medicas}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {currentView === 'grid' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre del paciente..."
                  value={searchRut}
                  onChange={(e) => setSearchRut(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-500"
                />
              </div>
              <button 
                onClick={handleNewPatient}
                className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Paciente
              </button>
            </div>
          )}
        </div>

        {/* Contenido dinámico - Grilla o Detalle */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'grid' ? (
            /* Tabla de pacientes */
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-slate-50 border-b border-cyan-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Dirección
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-cyan-100">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-12 h-12 text-slate-400 mb-4" />
                            <p className="text-slate-700 text-lg mb-2">
                              {searchRut
                                ? "No se encontraron pacientes con ese nombre"
                                : "No hay pacientes registrados"}
                            </p>
                            <p className="text-slate-500 text-sm">
                              {searchRut
                                ? "Intenta con otro término de búsqueda"
                                : "Comienza agregando un nuevo paciente"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          onClick={() => handlePatientClick(patient)}
                          className="hover:bg-cyan-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-700">
                              {patient.nombres} {patient.apellidos}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {calculateAge(patient.fecha_nacimiento)} años
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {patient.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {patient.telefono}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {patient.direccion}, {patient.ciudad}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-cyan-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">Página 1 de 1</div>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Vista de detalle del paciente */
            selectedPatient && (
              <PatientDetail
                patient={selectedPatient}
                onBack={handleBackToGrid}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export { Patient };