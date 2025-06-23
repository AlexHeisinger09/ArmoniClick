import { useState, useRef } from "react";
import {
  User,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Bell,
  Palette,
  Upload,
  X,
  Check,
  AlertCircle
} from "lucide-react";

// Tipos e interfaces
interface DoctorProfile {
  id: number;
  name: string;
  lastName: string;
  username: string;
  email: string;
  emailValidated: boolean;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  img?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface ProfileFormData {
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
}

// Componente principal de Configuración
const Configuration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Datos del doctor (simulados)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    id: 1,
    name: "Carlos Eduardo",
    lastName: "García Mendoza",
    username: "carlos.garcia",
    email: "carlos.garcia@clinica.com",
    emailValidated: true,
    phone: "+56912345678",
    address: "Av. Las Condes 1234",
    zipCode: "7550000",
    city: "Santiago",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-06-10T14:20:00Z",
    isActive: true
  });

  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    name: doctorProfile.name,
    lastName: doctorProfile.lastName,
    username: doctorProfile.username,
    email: doctorProfile.email,
    phone: doctorProfile.phone,
    address: doctorProfile.address,
    zipCode: doctorProfile.zipCode,
    city: doctorProfile.city,
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Función para mostrar mensajes temporales
  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage('');
    } else {
      setErrorMessage(message);
      setSuccessMessage('');
    }
    
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  // Pestañas de configuración
  const tabs = [
    { id: 'perfil', label: 'Información Personal', icon: User },
    { id: 'foto', label: 'Foto de Perfil', icon: Camera },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'preferencias', label: 'Preferencias', icon: Palette },
  ];

  // Manejadores de eventos
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = () => {
    // Simulación de guardado
    setDoctorProfile(prev => ({
      ...prev,
      ...profileFormData,
      updatedAt: new Date().toISOString()
    }));
    setIsEditing(false);
    showMessage('Información personal actualizada correctamente', 'success');
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    // Simulación de cambio de contraseña
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    showMessage('Contraseña actualizada correctamente', 'success');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDoctorProfile(prev => ({
          ...prev,
          img: result,
          updatedAt: new Date().toISOString()
        }));
        showMessage('Foto de perfil actualizada correctamente', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-700">
                  Información Personal
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileFormData.name}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileFormData.lastName}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileFormData.username}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileFormData.email}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileFormData.phone}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileFormData.city}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={profileFormData.zipCode}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dirección
                    </label>
                    <textarea
                      name="address"
                      value={profileFormData.address}
                      onChange={handleProfileInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-cyan-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleProfileSubmit}
                      className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Nombre Completo</p>
                        <p className="font-medium text-slate-700">
                          {doctorProfile.name} {doctorProfile.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Nombre de Usuario</p>
                        <p className="font-medium text-slate-700">
                          {doctorProfile.username}
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
                          {doctorProfile.email}
                        </p>
                        {doctorProfile.emailValidated && (
                          <div className="flex items-center mt-1">
                            <Check className="w-3 h-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-600">Verificado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Teléfono</p>
                        <p className="font-medium text-slate-700">
                          {doctorProfile.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Dirección</p>
                        <p className="font-medium text-slate-700">
                          {doctorProfile.address}
                        </p>
                        <p className="text-sm text-slate-500">
                          {doctorProfile.city}, {doctorProfile.zipCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Cuenta creada</p>
                        <p className="font-medium text-slate-700">
                          {formatDate(doctorProfile.createdAt)}
                        </p>
                        {doctorProfile.updatedAt && (
                          <p className="text-xs text-slate-500">
                            Última actualización: {formatDate(doctorProfile.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Estado de la cuenta</p>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            doctorProfile.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <p className="font-medium text-slate-700">
                            {doctorProfile.isActive ? 'Activa' : 'Inactiva'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'foto':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-6">
                Foto de Perfil
              </h3>

              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-cyan-200">
                    {doctorProfile.img ? (
                      <img
                        src={doctorProfile.img}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-medium text-slate-700 mb-2">
                    Cambiar foto de perfil
                  </h4>
                  <p className="text-slate-500 mb-4">
                    Sube una imagen cuadrada para obtener mejores resultados. 
                    Tamaño máximo: 5MB. Formatos aceptados: JPG, PNG.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors mx-auto md:mx-0"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir nueva foto
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-6">
                Cambiar Contraseña
              </h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Repite la nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-cyan-50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-cyan-800 mb-2">Requisitos de la contraseña:</h4>
                  <ul className="text-sm text-cyan-700 space-y-1">
                    <li className="flex items-center">
                      <Check className="w-3 h-3 mr-2" />
                      Mínimo 8 caracteres
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 mr-2" />
                      Al menos una letra mayúscula
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 mr-2" />
                      Al menos un número
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handlePasswordSubmit}
                  className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          </div>
        );

      case 'preferencias':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-6">
                Preferencias de la Aplicación
              </h3>

              <div className="space-y-6">
                {/* Notificaciones */}
                <div>
                  <h4 className="text-md font-medium text-slate-700 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notificaciones
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-700">Nuevas citas</p>
                        <p className="text-sm text-slate-500">Recibir notificaciones de nuevas citas agendadas</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-700">Recordatorios</p>
                        <p className="text-sm text-slate-500">Recordatorios de citas próximas</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-700">Reportes semanales</p>
                        <p className="text-sm text-slate-500">Resumen semanal de actividad</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-cyan-500 rounded" />
                    </label>
                  </div>
                </div>

                {/* Tema */}
                <div>
                  <h4 className="text-md font-medium text-slate-700 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Apariencia
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <input type="radio" name="theme" defaultChecked className="w-4 h-4 text-cyan-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-700">Modo claro</p>
                        <p className="text-sm text-slate-500">Interfaz con colores claros</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <input type="radio" name="theme" className="w-4 h-4 text-cyan-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-700">Modo oscuro</p>
                        <p className="text-sm text-slate-500">Interfaz con colores oscuros</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <input type="radio" name="theme" className="w-4 h-4 text-cyan-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-700">Automático</p>
                        <p className="text-sm text-slate-500">Sigue la configuración del sistema</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <img
              alt="Configuración"
              src="https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?q=80&w=2101&auto=format&fit=crop"
              className="w-20 rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-slate-700 sm:text-lg">
                Configuración del Perfil
              </h3>
              <p className="mt-0.5 text-slate-500">
                Administra tu información personal, configuraciones de seguridad y preferencias de la aplicación.
              </p>
            </div>
          </div>

          {/* Mensajes de éxito/error */}
          {(successMessage || errorMessage) && (
            <div className={`flex items-center p-4 rounded-xl mb-4 ${
              successMessage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {successMessage ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm font-medium">
                {successMessage || errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Pestañas de configuración */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
          <div className="border-b border-cyan-200">
            <nav className="flex space-x-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
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
    </div>
  );
};

export  {Configuration};