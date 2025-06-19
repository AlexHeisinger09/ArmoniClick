import { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Eye,
  Trash2,
  Plus,
  X,
  Save,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  ChevronRight,
  ChevronLeft,
  Shield,
  ArrowLeft,
  Clock,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  Pill,
  RefreshCw
} from "lucide-react";

// Importaciones para datos reales
import { usePatients } from "../hooks/patients/usePatients";
import { useAuth } from "../context/AuthContext";
import { Patient } from "@/core/entities/patient.entity";
import { useCreatePatient, useUpdatePatient, useDeletePatient } from "../hooks/patients/usePatientMutations";
import { PatientFormModal } from "./PatientFormModal";

// Tipos e interfaces existentes
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

interface PatientFormData {
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  email: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  codigoPostal: string;
}

interface PatientGridProps {
  doctorId?: number;
}

// Datos de ejemplo para tratamientos, citas y ficha médica (mantener como mock por ahora)
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
  }
];

// Datos iniciales para formularios
const initialEditFormData: PatientFormData = {
  rut: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  email: "",
  direccion: "",
  telefono: "",
  ciudad: "",
  codigoPostal: "",
};

// Componente para mostrar el detalle completo del paciente
const PatientDetail: React.FC<{
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
}> = ({ patient, onBack, onEdit }) => {
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
            <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-aesthetic-gris-profundo mb-2">
                    {patient.nombres} {patient.apellidos}
                  </h2>
                  <p className="text-aesthetic-gris-medio">RUT: {patient.rut}</p>
                </div>
                <div className="bg-aesthetic-lavanda/30 p-3 rounded-full">
                  <User className="w-8 h-8 text-aesthetic-gris-profundo" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-aesthetic-menta/30 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-aesthetic-gris-profundo" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Edad</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {calculateAge(patient.fechaNacimiento)} años
                    </p>
                    <p className="text-xs text-aesthetic-gris-medio">
                      {formatDate(patient.fechaNacimiento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-aesthetic-rosa/30 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-aesthetic-gris-profundo" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Teléfono</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {patient.telefono || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Email</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {patient.email || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {patient.direccion && (
                <div className="mt-4 pt-4 border-t border-aesthetic-lavanda/20">
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-aesthetic-gris-medio">Dirección</p>
                      <p className="font-medium text-aesthetic-gris-profundo">
                        {patient.direccion}
                      </p>
                      {patient.ciudad && (
                        <p className="text-sm text-aesthetic-gris-medio">
                          {patient.ciudad}{patient.codigoPostal && `, ${patient.codigoPostal}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tratamientos':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-aesthetic-gris-profundo">
                Tratamientos del Paciente
              </h3>
              <button className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tratamiento
              </button>
            </div>

            <div className="space-y-4">
              {mockTreatments.map((treatment) => (
                <div key={treatment.id} className="border border-aesthetic-lavanda/20 rounded-lg p-4 hover:bg-aesthetic-lavanda/5 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-aesthetic-gris-profundo text-lg">
                      {treatment.nombre}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(treatment.estado)}`}>
                      {treatment.estado}
                    </span>
                  </div>
                  <p className="text-aesthetic-gris-medio mb-3">
                    {treatment.descripcion}
                  </p>
                  <div className="flex items-center justify-between text-sm text-aesthetic-gris-medio">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Inicio: {formatDate(treatment.fecha_inicio)}
                      {treatment.fecha_fin && (
                        <span className="ml-4">
                          • Fin: {formatDate(treatment.fecha_fin)}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'citas':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-aesthetic-gris-profundo">
                Citas Programadas
              </h3>
              <button className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </button>
            </div>

            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-aesthetic-lavanda/20 rounded-lg p-4 hover:bg-aesthetic-lavanda/5 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-aesthetic-gris-profundo text-lg">
                        {appointment.tipo}
                      </h4>
                      <div className="flex items-center text-aesthetic-gris-medio mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(appointment.fecha)} • {appointment.hora}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                      {appointment.estado}
                    </span>
                  </div>
                  {appointment.notas && (
                    <p className="text-aesthetic-gris-medio mb-3">
                      {appointment.notas}
                    </p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'historial':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-aesthetic-gris-profundo">
                Historial Médico
              </h3>
              <button className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Registro
              </button>
            </div>

            <div className="space-y-4">
              {mockMedicalRecords.map((record, index) => (
                <div key={index} className="border-l-4 border-aesthetic-lavanda pl-4 py-4 hover:bg-aesthetic-lavanda/5 transition-colors rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium text-aesthetic-gris-profundo">
                        {record.tipo}
                      </span>
                      <span className="text-sm text-aesthetic-gris-medio">
                        • {record.medico}
                      </span>
                    </div>
                    <span className="text-sm text-aesthetic-gris-medio">
                      {formatDate(record.fecha)}
                    </span>
                  </div>
                  <p className="text-aesthetic-gris-medio">
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
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors p-2 rounded-lg hover:bg-aesthetic-lavanda/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
        </div>
        <button
          onClick={() => onEdit(patient)}
          className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Paciente
        </button>
      </div>

      {/* Pestañas de navegación */}
      <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 overflow-hidden">
        <div className="border-b border-aesthetic-lavanda/20">
          <nav className="flex space-x-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-aesthetic-lavanda text-aesthetic-gris-profundo bg-aesthetic-lavanda/10'
                      : 'border-transparent text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo hover:bg-aesthetic-lavanda/5'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Componente principal PatientGrid ACTUALIZADO
const PatientGrid: React.FC<PatientGridProps> = () => {
  // Usar datos reales en lugar de mock
  const { user, token } = useAuth();
  const { patients, isLoading, error, refetch } = usePatients(token || undefined);
  const deletePatientMutation = useDeletePatient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchRut, setSearchRut] = useState("");

  // Estados para vista
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editFormData, setEditFormData] = useState<PatientFormData>(initialEditFormData);

  // Efectos para manejar datos reales
  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(patients);
    }
  }, [patients]);

  // Filtrar pacientes por RUT
  useEffect(() => {
    if (searchRut.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        patient.rut.toLowerCase().includes(searchRut.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchRut, patients]);

  // Funciones utilitarias ACTUALIZADAS para los nuevos campos
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

  // Manejadores de eventos ACTUALIZADOS
  const handleEdit = (patient: Patient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPatient(patient);
    setShowFormModal(true);
  };

  const handleViewDetail = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleDelete = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setShowDeleteAlert(true);
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedPatient(null);
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      try {
        await deletePatientMutation.mutateAsync(selectedPatient.id);
        setShowDeleteAlert(false);
        setSelectedPatient(null);
      } catch (error) {
        console.error('Error al eliminar paciente:', error);
      }
    }
  };

  // Simulación de actualización (necesitará implementar PUT en API)
  const handleEditSubmit = () => {
    if (selectedPatient) {
      // TODO: Implementar actualización real via API
      console.log('Actualizar paciente:', selectedPatient.id, editFormData);
      setShowEditModal(false);
      setSelectedPatient(null);
      setEditFormData(initialEditFormData);
      // Recargar datos después de actualizar
      refetch();
    }
  };
  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingPatient(null);
    // Los datos se actualizan automáticamente por React Query
  };
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowDeleteAlert(false);
    setSelectedPatient(null);
    setEditFormData(initialEditFormData);
  };

  // Render condicional para loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aesthetic-lavanda"></div>
      </div>
    );
  }

  // Render condicional para error
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-center">
          <div className="text-red-500 mb-2 font-semibold">Error al cargar pacientes</div>
          <p className="text-aesthetic-gris-medio text-sm mb-4">
            {error.message || 'Ocurrió un error inesperado'}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-aesthetic min-h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Barra de búsqueda y acciones - SIEMPRE VISIBLE */}
        <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              className="w-20 rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-aesthetic-gris-profundo sm:text-lg">
                {currentView === 'grid' ? 'Gestión de Pacientes' : `Paciente: ${selectedPatient?.nombres} ${selectedPatient?.apellidos}`}
              </h3>
              <p className="mt-0.5 text-aesthetic-gris-medio">
                {currentView === 'grid'
                  ? `Administra la información de tus ${patients.length} pacientes de manera eficiente y organizada.`
                  : 'Vista detallada con tratamientos, citas y historial médico completo.'
                }
              </p>
            </div>
          </div>
          {currentView === 'grid' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por RUT del paciente..."
                  value={searchRut}
                  onChange={(e) => setSearchRut(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-sm text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => refetch()}
                  className="flex items-center bg-aesthetic-menta hover:bg-aesthetic-menta-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-4 py-2.5 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </button>
                <button
                  onClick={handleNewPatient}
                  className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Paciente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contenido dinámico - Grilla o Detalle */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'grid' ? (
            /* Tabla de pacientes */
            <div className="bg-white rounded-xl shadow-sm border border-aesthetic-lavanda/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-aesthetic-gris-claro border-b border-aesthetic-lavanda/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        RUT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-aesthetic-gris-profundo uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-aesthetic-lavanda/10">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-12 h-12 text-aesthetic-gris-medio/50 mb-4" />
                            <p className="text-aesthetic-gris-profundo text-lg mb-2">
                              {searchRut
                                ? "No se encontraron pacientes con ese RUT"
                                : "No hay pacientes registrados"}
                            </p>
                            <p className="text-aesthetic-gris-medio text-sm">
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
                          className="hover:bg-aesthetic-lavanda/10 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-aesthetic-gris-profundo">
                              {patient.rut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-aesthetic-gris-profundo">
                              {patient.nombres} {patient.apellidos}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-aesthetic-gris-profundo">
                              {calculateAge(patient.fechaNacimiento)} años
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-aesthetic-gris-profundo">
                              {patient.telefono || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-aesthetic-gris-profundo">
                              {patient.email || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <button
                                onClick={(e) => handleViewDetail(patient, e)}
                                className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => handleEdit(patient, e)}
                                className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(patient, e)}
                                className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-aesthetic-lavanda/20 bg-aesthetic-gris-claro">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-aesthetic-gris-medio">
                      Mostrando {filteredPatients.length} de {patients.length} pacientes
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 text-sm bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="px-4 py-2 text-sm bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                onEdit={handleEdit}
              />
            )
          )}
        </div>
      </div>

      {/* Modales existentes actualizados para nuevos campos... */}
      {/* Modal de Detalle */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-aesthetic-gris-profundo">
                Detalle del Paciente
              </h3>
              <button
                onClick={closeModals}
                className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-aesthetic-lavanda/30 p-2 rounded-full">
                    <Eye className="w-5 h-5 text-aesthetic-gris-profundo" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">RUT</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {selectedPatient.rut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Fecha de Nacimiento</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {formatDate(selectedPatient.fechaNacimiento)}
                    </p>
                    <p className="text-sm text-aesthetic-gris-medio">
                      {calculateAge(selectedPatient.fechaNacimiento)} años
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-aesthetic-rosa/30 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-aesthetic-gris-profundo" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Teléfono</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {selectedPatient.telefono || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-aesthetic-menta/30 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-aesthetic-gris-profundo" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Email</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {selectedPatient.email || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-aesthetic-gris-medio">Dirección</p>
                    <p className="font-medium text-aesthetic-gris-profundo">
                      {selectedPatient.direccion || 'No especificado'}
                    </p>
                    {selectedPatient.ciudad && (
                      <p className="text-sm text-aesthetic-gris-medio">
                        {selectedPatient.ciudad}{selectedPatient.codigoPostal && `, ${selectedPatient.codigoPostal}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-aesthetic-gris-claro p-4 rounded-xl mt-6">
              <h4 className="font-semibold text-aesthetic-gris-profundo mb-2">
                Información Personal
              </h4>
              <p className="text-lg font-medium text-aesthetic-gris-profundo">
                {selectedPatient.nombres} {selectedPatient.apellidos}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModals}
                className="bg-aesthetic-gris-claro hover:bg-aesthetic-gris-claro/80 text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
        
      {/* Modal de Edición actualizado para nuevos campos */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-aesthetic-gris-profundo">
                Editar Paciente
              </h3>
              <button
                onClick={closeModals}
                className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    name="rut"
                    value={editFormData.rut}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={editFormData.nombres}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={editFormData.apellidos}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={editFormData.fechaNacimiento}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={editFormData.ciudad}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={editFormData.codigoPostal}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-aesthetic-gris-profundo mb-1">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleEditInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-aesthetic-lavanda/30 rounded-xl focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent text-aesthetic-gris-profundo"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-aesthetic-lavanda/20">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-aesthetic-gris-claro hover:bg-aesthetic-gris-claro/80 text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleEditSubmit}
                  className="flex items-center bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Confirmación para Eliminar */}
      {showDeleteAlert && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-aesthetic-gris-profundo">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-aesthetic-gris-medio mb-6">
              ¿Está seguro de que desea eliminar al paciente{" "}
              <span className="font-semibold text-aesthetic-gris-profundo">
                {selectedPatient.nombres} {selectedPatient.apellidos}
              </span>
              ?
            </p>

            <p className="text-sm text-red-600 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="bg-aesthetic-gris-claro hover:bg-aesthetic-gris-claro/80 text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientGrid;