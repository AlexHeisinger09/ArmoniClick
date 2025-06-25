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
  Pill
} from "lucide-react";
import { useProfile, useLoginMutation } from "@/presentation/hooks";

// ... (interfaces permanecen igual)
interface Patient {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  id_doctor: number;
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

interface PatientFormData {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  email: string;
  direccion: string;
  telefono: string;
}

interface PatientProps {
  doctorId?: number;
}

// Datos iniciales para formularios
const initialEditFormData: PatientFormData = {
  rut: "",
  nombres: "",
  apellidos: "",
  fecha_nacimiento: "",
  email: "",
  direccion: "",
  telefono: "",
};

// Datos de ejemplo para tratamientos, citas y ficha médica (permanecen igual)
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
    {/* Corazón central pulsante */}
    <div className="absolute inset-0 flex items-center justify-center">
      <Heart
        className="w-12 h-12 text-red-500 animate-pulse"
        style={{
          animation: 'pulse 2s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    {/* Estetoscopio rebotando */}
    <div className="absolute top-0 right-1">
      <Stethoscope
        className="w-6 h-6 text-cyan-600 animate-bounce"
        style={{
          animation: 'bounce 3s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    {/* Monitor de actividad pulsante */}
    <div className="absolute bottom-1 left-1">
      <Activity
        className="w-5 h-5 text-green-500"
        style={{
          animation: 'pulse 1.5s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    {/* Píldora rotando */}
    <div className="absolute top-2 left-3">
      <Pill
        className="w-4 h-4 text-blue-500 animate-spin"
        style={{
          animation: 'spin 4s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    {/* Partículas médicas flotantes */}
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
            {/* Información Personal del Paciente */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    {patient.nombres} {patient.apellidos}
                  </h2>
                  <p className="text-slate-500">RUT: {patient.rut}</p>
                </div>
                <div className="bg-cyan-100 p-3 rounded-full">
                  <User className="w-8 h-8 text-cyan-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Edad</p>
                    <p className="font-medium text-slate-700">
                      {calculateAge(patient.fecha_nacimiento)} años
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(patient.fecha_nacimiento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-700">
                      {patient.telefono}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-700">
                      {patient.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cyan-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Dirección</p>
                    <p className="font-medium text-slate-700">
                      {patient.direccion}
                    </p>
                  </div>
                </div>
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
                  <div className="flex items-center justify-between text-sm text-slate-500">
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
                      <button className="text-slate-500 hover:text-slate-700 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-slate-500 hover:text-slate-700 transition-colors">
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
                  <div className="flex justify-end space-x-2">
                    <button className="text-slate-500 hover:text-slate-700 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-slate-500 hover:text-slate-700 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-slate-500 hover:text-slate-700 transition-colors">
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
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-cyan-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
        </div>
        <button
          onClick={() => onEdit(patient)}
          className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Paciente
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

        {/* Contenido de la pestaña activa */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
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

  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editFormData, setEditFormData] =
    useState<PatientFormData>(initialEditFormData);

  // Datos de ejemplo
  const mockPatients: Patient[] = [
    {
      id: 1,
      rut: "12345678-9",
      nombres: "Alex",
      apellidos: "Heisinger Vivanco",
      fecha_nacimiento: "1985-03-15",
      telefono: "+56912345678",
      email: "heisinger.vivanco@gmail.com",
      direccion: "Av. Las Condes 1234, Santiago",
      id_doctor: 1,
    },
    {
      id: 2,
      rut: "87654321-0",
      nombres: "María Fernanda",
      apellidos: "López Silva",
      fecha_nacimiento: "1990-07-22",
      telefono: "+56987654321",
      email: "maria.lopez@email.com",
      direccion: "Calle Principal 567, Providencia",
      id_doctor: 1,
    },
    {
      id: 3,
      rut: "11223344-5",
      nombres: "Pedro Antonio",
      apellidos: "Martínez Rojas",
      fecha_nacimiento: "1978-12-03",
      telefono: "+56911223344",
      email: "pedro.martinez@email.com",
      direccion: "Pasaje Los Rosales 890, Las Condes",
      id_doctor: 1,
    },
    {
      id: 4,
      rut: "99887766-K",
      nombres: "Ana Sofía",
      apellidos: "García Muñoz",
      fecha_nacimiento: "1992-05-18",
      telefono: "+56999887766",
      email: "ana.garcia@email.com",
      direccion: "Av. Libertador 2345, Vitacura",
      id_doctor: 1,
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
  const handleEdit = (patient: Patient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPatient(patient);
    setEditFormData({ ...patient });
    setShowEditModal(true);
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

  const confirmDelete = () => {
    if (selectedPatient) {
      const updatedPatients = patients.filter(
        (p) => p.id !== selectedPatient.id
      );
      setPatients(updatedPatients);
      setFilteredPatients(
        updatedPatients.filter((patient) =>
          patient.rut.toLowerCase().includes(searchRut.toLowerCase())
        )
      );
      setShowDeleteAlert(false);
      setSelectedPatient(null);
    }
  };

  const handleEditSubmit = () => {
    if (selectedPatient) {
      const updatedPatients = patients.map((p) =>
        p.id === selectedPatient.id
          ? { ...selectedPatient, ...editFormData }
          : p
      );
      setPatients(updatedPatients);
      setFilteredPatients(
        updatedPatients.filter((patient) =>
          patient.rut.toLowerCase().includes(searchRut.toLowerCase())
        )
      );
      setShowEditModal(false);
      setSelectedPatient(null);
      setEditFormData(initialEditFormData);
    }
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
            <div>
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
            </div>
          </div>
          {currentView === 'grid' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por RUT del paciente..."
                  value={searchRut}
                  onChange={(e) => setSearchRut(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-500"
                />
              </div>
              <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm">
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
                        RUT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-cyan-100">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-12 h-12 text-slate-400 mb-4" />
                            <p className="text-slate-700 text-lg mb-2">
                              {searchRut
                                ? "No se encontraron pacientes con ese RUT"
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
                            <span className="text-sm font-medium text-slate-700">
                              {patient.rut}
                            </span>
                          </td>
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
                              {patient.telefono}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {patient.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <button
                                onClick={(e) => handleViewDetail(patient, e)}
                                className="text-slate-500 hover:text-slate-700 transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => handleEdit(patient, e)}
                                className="text-slate-500 hover:text-slate-700 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(patient, e)}
                                className="text-slate-500 hover:text-slate-700 transition-colors"
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
                onEdit={handleEdit}
              />
            )
          )}
        </div>
      </div>

      {/* Resto de modales con colores actualizados... */}
      {/* Modal de Detalle */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-700">
                Detalle del Paciente
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <Eye className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">RUT</p>
                    <p className="font-medium text-slate-700">
                      {selectedPatient.rut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fecha de Nacimiento</p>
                    <p className="font-medium text-slate-700">
                      {formatDate(selectedPatient.fecha_nacimiento)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {calculateAge(selectedPatient.fecha_nacimiento)} años
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-700">
                      {selectedPatient.telefono}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-700">
                      {selectedPatient.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Dirección</p>
                    <p className="font-medium text-slate-700">
                      {selectedPatient.direccion}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mt-6">
              <h4 className="font-semibold text-slate-700 mb-2">
                Información Personal
              </h4>
              <p className="text-lg font-medium text-slate-700">
                {selectedPatient.nombres} {selectedPatient.apellidos}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModals}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-700">
                Editar Paciente
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    name="rut"
                    value={editFormData.rut || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={editFormData.nombres || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={editFormData.apellidos || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={editFormData.fecha_nacimiento || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={editFormData.direccion || ""}
                  onChange={handleEditInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-cyan-200">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleEditSubmit}
                  className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm"
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
              <h3 className="text-lg font-bold text-slate-700">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-slate-500 mb-6">
              ¿Está seguro de que desea eliminar al paciente{" "}
              <span className="font-semibold text-slate-700">
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
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
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

export { Patient };