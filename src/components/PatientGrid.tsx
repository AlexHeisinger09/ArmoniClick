import { useState, useEffect } from 'react';
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
  Heart, 
  Shield 
} from 'lucide-react';

// Tipos e interfaces
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

interface PatientFormData {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  email: string;
  direccion: string;
  telefono: string;
}

interface PatientGridProps {
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

// Componente Footer
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Logo y descripción */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg">ArmoniClick</span>
            </div>
            <div className="text-sm text-gray-500">
              Sistema de Gestión Médica
            </div>
          </div>

          {/* Enlaces y información */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Datos protegidos con SSL</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+56 2 2345 6789</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>soporte@armoniclick.cl</span>
            </div>
          </div>
        </div>

        {/* Segunda fila con copyright y enlaces */}
        {/* <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="text-sm text-gray-500">
            © {currentYear} ArmoniClick. Todos los derechos reservados.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Ayuda
            </a>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

// Componente principal PatientGrid
const PatientGrid: React.FC<PatientGridProps> = ({ doctorId = 1 }) => {
  // Estados principales
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchRut, setSearchRut] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState<PatientFormData>(initialEditFormData);

  // Datos de ejemplo
  const mockPatients: Patient[] = [
    {
      id: 1,
      rut: '12345678-9',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      fecha_nacimiento: '1985-03-15',
      telefono: '+56912345678',
      email: 'juan.perez@email.com',
      direccion: 'Av. Las Condes 1234, Santiago',
      id_doctor: 1
    },
    {
      id: 2,
      rut: '87654321-0',
      nombres: 'María Fernanda',
      apellidos: 'López Silva',
      fecha_nacimiento: '1990-07-22',
      telefono: '+56987654321',
      email: 'maria.lopez@email.com',
      direccion: 'Calle Principal 567, Providencia',
      id_doctor: 1
    },
    {
      id: 3,
      rut: '11223344-5',
      nombres: 'Pedro Antonio',
      apellidos: 'Martínez Rojas',
      fecha_nacimiento: '1978-12-03',
      telefono: '+56911223344',
      email: 'pedro.martinez@email.com',
      direccion: 'Pasaje Los Rosales 890, Las Condes',
      id_doctor: 1
    },
    {
      id: 4,
      rut: '99887766-K',
      nombres: 'Ana Sofía',
      apellidos: 'García Muñoz',
      fecha_nacimiento: '1992-05-18',
      telefono: '+56999887766',
      email: 'ana.garcia@email.com',
      direccion: 'Av. Libertador 2345, Vitacura',
      id_doctor: 1
    }
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
    if (searchRut.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.rut.toLowerCase().includes(searchRut.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchRut, patients]);

  // Funciones utilitarias
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Manejadores de eventos
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({ ...patient });
    setShowEditModal(true);
  };

  const handleViewDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      const updatedPatients = patients.filter(p => p.id !== selectedPatient.id);
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients.filter(patient =>
        patient.rut.toLowerCase().includes(searchRut.toLowerCase()))
      );
      setShowDeleteAlert(false);
      setSelectedPatient(null);
    }
  };

  const handleEditSubmit = () => {
    if (selectedPatient) {
      const updatedPatients = patients.map(p =>
        p.id === selectedPatient.id ? { ...selectedPatient, ...editFormData } : p
      );
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients.filter(patient =>
        patient.rut.toLowerCase().includes(searchRut.toLowerCase())
      ));
      setShowEditModal(false);
      setSelectedPatient(null);
      setEditFormData(initialEditFormData);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <span className="text-gray-500 text-sm">Atenciones</span>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-blue-600 text-sm font-medium">Pacientes</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Título y descripción */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra la información de tus pacientes de manera eficiente</p>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por RUT del paciente..."
                value={searchRut}
                onChange={(e) => setSearchRut(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-5 h-5" />
              Nuevo Paciente
            </button>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando <span className="font-medium">{filteredPatients.length}</span> de <span className="font-medium">{patients.length}</span> pacientes
          </div>
        </div>

        {/* Tabla de pacientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    RUT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <User className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">
                          {searchRut ? 'No se encontraron pacientes con ese RUT' : 'No hay pacientes registrados'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {searchRut ? 'Intenta con otro término de búsqueda' : 'Comienza agregando un nuevo paciente'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{patient.rut}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {patient.nombres.charAt(0)}{patient.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.nombres} {patient.apellidos}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{calculateAge(patient.fecha_nacimiento)} años</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{patient.telefono}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{patient.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetail(patient)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Página 1 de 1
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                    Anterior
                  </button>
                  <button className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modal de Detalle */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Detalle del Paciente</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RUT</p>
                    <p className="font-medium text-gray-900">{selectedPatient.rut}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedPatient.fecha_nacimiento)}</p>
                    <p className="text-sm text-gray-500">{calculateAge(selectedPatient.fecha_nacimiento)} años</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{selectedPatient.telefono}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedPatient.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium text-gray-900">{selectedPatient.direccion}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mt-6">
              <h4 className="font-semibold text-gray-800 mb-2">Información Personal</h4>
              <p className="text-lg font-medium text-gray-900">
                {selectedPatient.nombres} {selectedPatient.apellidos}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModals}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
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
              <h3 className="text-xl font-bold text-gray-800">Editar Paciente</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <input
                    type="text"
                    name="rut"
                    value={editFormData.rut || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    value={editFormData.nombres || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={editFormData.apellidos || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={editFormData.fecha_nacimiento || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  name="direccion"
                  value={editFormData.direccion || ''}
                  onChange={handleEditInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleEditSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
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
              <h3 className="text-lg font-bold text-gray-800">Confirmar Eliminación</h3>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar al paciente{' '}
              <span className="font-semibold text-gray-800">
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
                className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
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