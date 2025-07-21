import { useState, useRef, useEffect } from "react";
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
  Shield,
  Bell,
  Palette,
  Upload,
  X,
  Check,
  AlertCircle,
  Settings,
  Cog,
  Loader
} from "lucide-react";
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useUpdateProfileMutation, useUpdatePasswordMutation } from "@/presentation/hooks/user/useUpdateProfile";
import { Spinner } from "@/presentation/components/ui/spinner";

// Tipos e interfaces
interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileFormData {
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
}

// Componente para iconos circulares
const CircularIcon: React.FC<{ icon: React.ElementType; isActive?: boolean }> = ({
  icon: Icon,
  isActive = false
}) => (
  <div className={`
    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
    ${isActive
      ? 'bg-cyan-500 shadow-md'
      : 'bg-cyan-100 hover:bg-cyan-200'
    }
  `}>
    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-600'}`} />
  </div>
);

// Componente de animación de engranajes
const GearsAnimation: React.FC = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center justify-center">
      <Settings
        className="w-12 h-12 text-cyan-500 animate-spin"
        style={{
          animation: 'spin 4s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute top-1 right-1">
      <Cog
        className="w-6 h-6 text-cyan-600 animate-spin"
        style={{
          animation: 'spin 3s linear infinite reverse',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute bottom-2 left-2">
      <Settings
        className="w-4 h-4 text-cyan-400 animate-spin"
        style={{
          animation: 'spin 5s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute inset-0">
      <div className="absolute top-2 left-3 w-1 h-1 bg-cyan-300 rounded-full animate-ping"
        style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-4 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
        style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-3 left-4 w-1 h-1 bg-cyan-500 rounded-full animate-ping"
        style={{ animationDelay: '2s' }}></div>
    </div>
  </div>
);

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

  // Hooks para datos reales del usuario
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const { updateProfileMutation, isLoadingUpdate } = useUpdateProfileMutation();
  const { updatePasswordMutation, isLoadingPasswordUpdate } = useUpdatePasswordMutation();

  // Estados para formularios
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    name: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

 // Actualizar formulario cuando se cargan los datos del usuario
useEffect(() => {
  console.log('🔍 queryProfile.data:', queryProfile.data);
  if (queryProfile.data) {
    console.log('📝 Setting form data with:', {
      name: queryProfile.data.name || '',
      lastName: queryProfile.data.lastName || '',
      username: queryProfile.data.username || '',
      email: queryProfile.data.email || '',
      phone: queryProfile.data.phone || '', // ✅ Obtener del backend
      address: queryProfile.data.address || '', // ✅ Obtener del backend
      zipCode: queryProfile.data.zipCode || '', // ✅ Obtener del backend
      city: queryProfile.data.city || '', // ✅ Obtener del backend
    });
    
    setProfileFormData({
      name: queryProfile.data.name || '',
      lastName: queryProfile.data.lastName || '',
      username: queryProfile.data.username || '',
      email: queryProfile.data.email || '',
      phone: queryProfile.data.phone || '', // ✅ Cambiar aquí
      address: queryProfile.data.address || '', // ✅ Cambiar aquí
      zipCode: queryProfile.data.zipCode || '', // ✅ Cambiar aquí
      city: queryProfile.data.city || '', // ✅ Cambiar aquí
    });
  }
}, [queryProfile.data]);

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
    }, 5000);
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

  const handleProfileSubmit = async () => {
    try {
      // Convertir ProfileFormData a Record<string, string>
      const dataToSend: Record<string, string> = {
        name: profileFormData.name,
        lastName: profileFormData.lastName,
        username: profileFormData.username,
        email: profileFormData.email,
        phone: profileFormData.phone || '',
        address: profileFormData.address || '',
        zipCode: profileFormData.zipCode || '',
        city: profileFormData.city || '',
      };

      console.log('📤 Sending profile data:', dataToSend);

      await updateProfileMutation.mutateAsync(dataToSend);
      setIsEditing(false);
      showMessage('Información personal actualizada correctamente', 'success');
    } catch (error: any) {
      console.log('❌ Profile update error:', error);
      showMessage(error.message || 'Error al actualizar el perfil', 'error');
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showMessage('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Error al cambiar la contraseña', 'error');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Aquí iría la llamada real para subir la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          showMessage('Foto de perfil actualizada correctamente', 'success');
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        showMessage(error.message || 'Error al subir la imagen', 'error');
      }
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (queryProfile.isLoading) {
    return (
      <div className="bg-slate-50 min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <GearsAnimation />
          <p className="mt-4 text-slate-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pueden cargar los datos
  if (queryProfile.isError) {
    return (
      <div className="bg-slate-50 min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Error al cargar los datos</h3>
          <p className="text-slate-500 mb-4">No se pudieron cargar los datos del perfil</p>
          <button
            onClick={() => queryProfile.refetch()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const userData = queryProfile.data;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-700">
                  Información Personal
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                  disabled={isLoadingUpdate}
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
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileFormData.name}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        disabled={isLoadingUpdate}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileFormData.lastName}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        disabled={isLoadingUpdate}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre de Usuario *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileFormData.username}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        disabled={isLoadingUpdate}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileFormData.email}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        disabled={isLoadingUpdate}
                        required
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
                        disabled={isLoadingUpdate}
                        placeholder="Ej: +56912345678"
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
                        disabled={isLoadingUpdate}
                        placeholder="Ej: Santiago"
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
                        disabled={isLoadingUpdate}
                        placeholder="Ej: 8320000"
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
                      disabled={isLoadingUpdate}
                      placeholder="Ej: Av. Las Condes 1234, Oficina 567"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-cyan-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                      disabled={isLoadingUpdate}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleProfileSubmit}
                      className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors disabled:opacity-50"
                      disabled={isLoadingUpdate}
                    >
                      {isLoadingUpdate ? (
                        <Spinner size="small" show={true} className="text-white mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isLoadingUpdate ? 'Guardando...' : 'Guardar Cambios'}
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
                          {userData?.name} {userData?.lastName}
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
                          {userData?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Mail className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-medium text-slate-700">
                          {userData?.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <Check className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Verificado</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Phone className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Teléfono</p>
                        <p className="font-medium text-slate-700">
                          {profileFormData.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <MapPin className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Dirección</p>
                        <p className="font-medium text-slate-700">
                          {profileFormData.address || 'No especificada'}
                        </p>
                        {profileFormData.city && (
                          <p className="text-sm text-slate-500">
                            {profileFormData.city}, {profileFormData.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">ID de Usuario</p>
                        <p className="font-medium text-slate-700">
                          #{userData?.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Shield className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Estado de la cuenta</p>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                          <p className="font-medium text-slate-700">Activa</p>
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
                    {userData?.img ? (
                      <img
                        src={userData.img}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cyan-500">
                        <span className="text-white font-bold text-2xl">
                          {userData?.name?.[0]?.toUpperCase() || ''}{userData?.lastName?.[0]?.toUpperCase() || ''}
                        </span>
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
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Ingresa tu contraseña actual"
                      disabled={isLoadingPasswordUpdate}
                      required
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
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isLoadingPasswordUpdate}
                      required
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
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                      placeholder="Repite la nueva contraseña"
                      disabled={isLoadingPasswordUpdate}
                      required
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
                      <Check className={`w-3 h-3 mr-2 ${passwordForm.newPassword.length >= 6 ? 'text-green-600' : 'text-slate-400'}`} />
                      Mínimo 6 caracteres
                    </li>
                    <li className="flex items-center">
                      <Check className={`w-3 h-3 mr-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                      Al menos una letra mayúscula
                    </li>
                    <li className="flex items-center">
                      <Check className={`w-3 h-3 mr-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                      Al menos un número
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handlePasswordSubmit}
                  className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors disabled:opacity-50"
                  disabled={isLoadingPasswordUpdate || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  {isLoadingPasswordUpdate ? (
                    <Spinner size="small" show={true} className="text-white mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  {isLoadingPasswordUpdate ? 'Actualizando...' : 'Actualizar Contraseña'}
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
                    <CircularIcon icon={Bell} />
                    <span className="ml-3">Notificaciones</span>
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
                    <CircularIcon icon={Palette} />
                    <span className="ml-3">Apariencia</span>
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
        {/* Encabezado con animación de engranajes */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <GearsAnimation />
            <div>
              <h3 className="font-medium text-slate-700 sm:text-lg">
                Configuración del Perfil
              </h3>
              <p className="mt-0.5 text-slate-500">
                {/* Bienvenido Dr(a) {userData?.name} {userData?.lastName}.  */}
                Administra tu información personal, configuraciones de seguridad y preferencias.
              </p>
            </div>
          </div>

          {/* Mensajes de éxito/error */}
          {(successMessage || errorMessage) && (
            <div className={`flex items-center p-4 rounded-xl mb-4 ${successMessage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
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

        {/* Pestañas de configuración con iconos circulares */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
          <div className="border-b border-cyan-200">
            <nav className="flex space-x-0 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                        ? 'border-cyan-500 text-slate-700 bg-cyan-50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-cyan-25'
                      }`}
                  >
                    <CircularIcon icon={Icon} isActive={isActive} />
                    <span className="ml-3">{tab.label}</span>
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

export { Configuration };