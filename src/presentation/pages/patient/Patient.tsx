// src/presentation/pages/patient/Patient.tsx - ACTUALIZADO PARA USAR API REAL
import { useState } from "react";
import {
  Search,
  Plus,
  Calendar,
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
  AlertCircle,
  Info,
  Edit,
  Trash2
} from "lucide-react";
import { useLoginMutation } from "@/presentation/hooks";
import { NewPatientModal, PatientFormData } from "./NewPatientModal";
import { EditPatientModal, PatientFormData as EditPatientFormData } from "./EditPatientModal";

// IMPORTAR LOS NUEVOS HOOKS
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/presentation/hooks/patients/usePatients";

// USAR LA INTERFACE REAL DEL BACKEND
import { Patient as PatientType } from "@/core/use-cases/patients";

// Interfaces para tratamientos y citas (mantener como mock por ahora)
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

// Datos de ejemplo para tratamientos, citas e historial (mantener como mock)
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

// Componente de animación médica
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
  patient: PatientType;
  onBack: () => void;
  onEdit: (patient: PatientType) => void;
  onDelete: (patientId: number) => void;
}> = ({ patient, onBack, onEdit, onDelete }) => {
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
                  <p className="text-slate-500">Edad: {calculateAge(patient.fecha_nacimiento)} años</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onEdit(patient)}
                    className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Paciente
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
                        onDelete(patient.id);
                      }
                    }}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-2">Email</p>
                  <p className="text-sm text-slate-700">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-2">Teléfono</p>
                  <p className="text-sm text-slate-700">{patient.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-2">Dirección</p>
                  <p className="text-sm text-slate-700">{patient.direccion}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-2">Ciudad</p>
                  <p className="text-sm text-slate-700">{patient.ciudad}</p>
                </div>
              </div>

              {/* Información médica */}
              <div className="mt-6 pt-6 border-t border-cyan-200">
                <h4 className="font-semibold text-slate-700 mb-4">Información Médica</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patient.alergias && (
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">Alergias</p>
                      <p className="text-sm text-slate-700">{patient.alergias}</p>
                    </div>
                  )}

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
    </div>
  );
};

// Componente principal Patient
const Patient: React.FC<PatientProps> = ({ doctorId = 1 }) => {
  // Estados para vista
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientType | null>(null);

  // USAR LOS HOOKS REALES EN LUGAR DE DATOS MOCK
  const { queryPatients } = usePatients(searchTerm.trim() || undefined);
  const { createPatientMutation, isLoadingCreate } = useCreatePatient();
  const { updatePatientMutation, isLoadingUpdate } = useUpdatePatient();
  const { deletePatientMutation, isLoadingDelete } = useDeletePatient();

  // Obtener datos de la query
  const patients = queryPatients.data?.patients || [];
  const loading = queryPatients.isLoading;

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
  const handlePatientClick = (patient: PatientType) => {
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
  };

  const handleSubmitNewPatient = async (formData: PatientFormData) => {
    try {
      await createPatientMutation.mutateAsync({
        rut: formData.rut,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        codigo_postal: formData.codigo_postal,
        alergias: formData.alergias,
        medicamentos_actuales: formData.medicamentos_actuales,
        enfermedades_cronicas: formData.enfermedades_cronicas,
        cirugias_previas: formData.cirugias_previas,
        hospitalizaciones_previas: formData.hospitalizaciones_previas,
        notas_medicas: formData.notas_medicas,
      });
      
      alert('Paciente creado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al crear el paciente');
    }
  };

  // Manejadores para el modal de editar paciente
  const handleEditPatient = (patient: PatientType) => {
    setPatientToEdit(patient);
    setShowEditPatientModal(true);
  };

  const handleCloseEditPatientModal = () => {
    setShowEditPatientModal(false);
    setPatientToEdit(null);
  };

  const handleSubmitEditPatient = async (patientId: number, formData: EditPatientFormData) => {
    try {
      await updatePatientMutation.mutateAsync({
        patientId,
        patientData: {
          rut: formData.rut,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          codigo_postal: formData.codigo_postal,
          alergias: formData.alergias,
          medicamentos_actuales: formData.medicamentos_actuales,
          enfermedades_cronicas: formData.enfermedades_cronicas,
          cirugias_previas: formData.cirugias_previas,
          hospitalizaciones_previas: formData.hospitalizaciones_previas,
          notas_medicas: formData.notas_medicas,
        },
      });

      // Si el paciente está siendo visualizado, actualizarlo
      if (selectedPatient && selectedPatient.id === patientId) {
        // La query se invalidará automáticamente y los datos se actualizarán
        setCurrentView('grid'); // Volver a la lista para ver los cambios
      }
      
      alert('Paciente actualizado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al actualizar el paciente');
    }
  };

  // Manejador para eliminar paciente
  const handleDeletePatient = async (patientId: number) => {
    try {
      await deletePatientMutation.mutateAsync(patientId);
      
      // Volver a la lista después de eliminar
      setCurrentView('grid');
      setSelectedPatient(null);
      
      alert('Paciente eliminado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el paciente');
    }
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
        {/* Barra de búsqueda y acciones */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <PatientsAnimation />
            <div className="flex-1">
              <h3 className="font-medium text-slate-700 sm:text-lg">
                {currentView === 'grid' ? 'Gestión de Pacientes' : `Paciente: ${selectedPatient?.nombres} ${selectedPatient?.apellidos}`}
              </h3>
              <p className="mt-0.5 text-slate-500">
                {currentView === 'grid'
                  ? `Gestión integral de pacientes conectada a tu base de datos. Buscar, crear, editar y administrar la información médica de tus pacientes de forma segura.`
                  : ''
                }
              </p>

              {/* Cuadros de alertas médicas - Solo en vista de detalle */}
              {currentView === 'detail' && selectedPatient && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className={`px-4 py-2 rounded-lg border-2 ${selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas"
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
                        <p className={`text-xs font-medium ${selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas"
                            ? 'text-red-700'
                            : 'text-green-700'
                          }`}>
                          Alergias
                        </p>
                        <p className={`text-sm ${selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas"
                            ? 'text-red-800'
                            : 'text-green-800'
                          }`}>
                          {selectedPatient.alergias || "Sin alergias"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-lg border-2 ${selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas"
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
                        <p className={`text-xs font-medium ${selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas"
                            ? 'text-orange-700'
                            : 'text-green-700'
                          }`}>
                          Enfermedades Crónicas
                        </p>
                        <p className={`text-sm ${selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas"
                            ? 'text-orange-800'
                            : 'text-green-800'
                          }`}>
                          {selectedPatient.enfermedades_cronicas || "Sin enfermedades"}
                        </p>
                      </div>
                    </div>
                  </div>

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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-500"
                />
              </div>
              <button
                onClick={handleNewPatient}
                disabled={isLoadingCreate}
                className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isLoadingCreate ? 'Creando...' : 'Nuevo Paciente'}
              </button>
            </div>
          )}
        </div>

        {/* Contenido dinámico */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'grid' ? (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
              {/* Vista Desktop - Tabla */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-slate-50 border-b border-cyan-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Nombre Completo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          RUT
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
                          Ciudad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-cyan-100">
                      {patients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <User className="w-12 h-12 text-slate-400 mb-4" />
                              <p className="text-slate-700 text-lg mb-2">
                                {searchTerm
                                  ? "No se encontraron pacientes con ese nombre"
                                  : "No hay pacientes registrados"}
                              </p>
                              <p className="text-slate-500 text-sm">
                                {searchTerm
                                  ? "Intenta con otro término de búsqueda"
                                  : "Comienza agregando un nuevo paciente"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
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
                                {patient.rut}
                              </span>
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
                                {patient.ciudad}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="md:hidden">
                {patients.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-slate-400 mb-4" />
                      <p className="text-slate-700 text-lg mb-2">
                        {searchTerm
                          ? "No se encontraron pacientes con ese nombre"
                          : "No hay pacientes registrados"}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {searchTerm
                          ? "Intenta con otro término de búsqueda"
                          : "Comienza agregando un nuevo paciente"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-cyan-100">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientClick(patient)}
                        className="p-4 hover:bg-cyan-50 transition-colors cursor-pointer active:bg-cyan-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-700 mb-1">
                              {patient.nombres} {patient.apellidos}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {calculateAge(patient.fecha_nacimiento)} años • RUT: {patient.rut}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="truncate">{patient.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span>{patient.telefono}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="truncate">{patient.direccion}, {patient.ciudad}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paginación */}
              {patients.length > 0 && (
                <div className="px-4 md:px-6 py-4 border-t border-cyan-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {queryPatients.data?.total || 0} paciente(s) encontrado(s)
                    </div>
                    <div className="flex space-x-1 md:space-x-2">
                      <button
                        className="px-2 md:px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="px-2 md:px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            )
          )}
        </div>

        {/* Modal de Nuevo Paciente */}
        <NewPatientModal
          isOpen={showNewPatientModal}
          onClose={handleCloseNewPatientModal}
          onSubmit={handleSubmitNewPatient}
        />

        {/* Modal de Editar Paciente */}
        <EditPatientModal
          isOpen={showEditPatientModal}
          patient={patientToEdit}
          onClose={handleCloseEditPatientModal}
          onSubmit={handleSubmitEditPatient}
        />
      </div>
    </div>
  );
};

export { Patient };