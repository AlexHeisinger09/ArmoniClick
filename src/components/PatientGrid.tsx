import { useState, useEffect } from 'react';
import { Search, Edit, Eye, Trash2, Plus, X, Save, Calendar, Phone, Mail, MapPin, User } from 'lucide-react';

// Componente Header separado (puede moverse a otro archivo si lo prefieres)
const Header = ({ logo, user }: { logo: string | React.ReactNode; user: { name: string; rut: string; avatar?: string } }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo de la aplicación */}
          <div className="flex-shrink-0 flex items-center">
            {typeof logo === 'string' ? (
              <img className="h-8 w-auto" src={logo} alt="Logo de la aplicación" />
            ) : (
              logo
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.rut}</p>
            </div>

            {/* Avatar del usuario */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={`Avatar de ${user.name}`}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left text-sm text-gray-500 mb-4 md:mb-0">
            © {currentYear} ArmoniClick. Todos los derechos reservados.
          </div>
          <div className="flex justify-center md:justify-end space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Términos</span>
              <span className="text-sm">Términos y condiciones</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Privacidad</span>
              <span className="text-sm">Política de privacidad</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Contacto</span>
              <span className="text-sm">Contacto</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
const initialEditFormData={
    rut:"",
    nombres:"",
    apellidos:"",
    fecha_nacimiento:"",
    email:"",
    direccion:"",
    telefono:"",
  }
const PatientGrid = ({ doctorId = 1 }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchRut, setSearchRut] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editFormData, setEditFormData] = useState(initialEditFormData);

  // Datos del usuario logueado (simulado)
  const [currentUser] = useState({
    name: 'Dra. Camila Delgado',
    rut: '12345678-9',
    avatar: '' // Dejar vacío para usar el ícono por defecto
  });

  // Datos de ejemplo simulando la respuesta de la base de datos
  const mockPatients = [
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

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({ ...patient });
    setShowEditModal(true);
  };

  const handleViewDetail = (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    const updatedPatients = patients.filter(p => p.id !== selectedPatient.id);
    setPatients(updatedPatients);
    setFilteredPatients(updatedPatients.filter(patient =>
      patient.rut.toLowerCase().includes(searchRut.toLowerCase()))
    );
    setShowDeleteAlert(false);
    setSelectedPatient(null);
  };

  const handleEditSubmit = () => {
    const updatedPatients = patients.map(p =>
      p.id === selectedPatient.id ? { ...editFormData } : p
    );
    setPatients(updatedPatients);
    setFilteredPatients(updatedPatients.filter(patient =>
      patient.rut.toLowerCase().includes(searchRut.toLowerCase())
    ));
    setShowEditModal(false);
    setSelectedPatient(null);
    setEditFormData(initialEditFormData);
  };

  const handleEditInputChange = (e) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información del usuario */}
      <Header
        logo={
          <div className="flex items-center">
            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-800">ArmoniClick</span>
          </div>
        }
        user={currentUser}
      />

      {/* Contenido principal */}
      <main className="p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Pacientes</h2>

          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por RUT del paciente..."
                value={searchRut}
                onChange={(e) => setSearchRut(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Paciente
            </button>
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </div>
        </div>

        {/* Tabla de pacientes */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan= {6} className="px-6 py-8 text-center text-gray-500">
                    {searchRut ? 'No se encontraron pacientes con ese RUT' : 'No hay pacientes registrados'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.rut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.nombres} {patient.apellidos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateAge(patient.fecha_nacimiento)} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(patient)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
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

        {/* Paginación (opcional) */}
        {filteredPatients.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Página 1 de 1
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors disabled:opacity-50" disabled>
                Anterior
              </button>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors disabled:opacity-50" disabled>
                Siguiente
              </button>
            </div>
          </div>
        )}

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
      </main>
      {/* Nuevo Footer */}
      <Footer />
    </div>
  );
};

export default PatientGrid;