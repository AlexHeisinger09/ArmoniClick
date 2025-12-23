// src/presentation/pages/configuration/tabs/ProfileTab.tsx
import { useState, useEffect } from "react";
import {
  Save,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  Shield,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useUpdateProfileMutation } from "@/presentation/hooks/user/useUpdateProfile";
import { Spinner } from "@/presentation/components/ui/spinner";

interface ProfileFormData {
  name: string;
  rut?: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  profession?: string;
  specialty?: string;
}

interface ProfileTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ showMessage }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Hooks para datos reales del usuario
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const { updateProfileMutation, isLoadingUpdate } = useUpdateProfileMutation();

  // Estado para formulario
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    name: '',
    rut: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    profession: '',
    specialty: '',
  });

  // Actualizar formulario cuando se cargan los datos del usuario
  useEffect(() => {
    if (queryProfile.data) {
      setProfileFormData({
        name: queryProfile.data.name || '',
        lastName: queryProfile.data.lastName || '',
        username: queryProfile.data.username || '',
        email: queryProfile.data.email || '',
        rut: queryProfile.data.rut || '',
        phone: queryProfile.data.phone || '',
        address: queryProfile.data.address || '',
        zipCode: queryProfile.data.zipCode || '',
        city: queryProfile.data.city || '',
        profession: queryProfile.data.profession || '',
        specialty: queryProfile.data.specialty || '',
      });
    }
  }, [queryProfile.data]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async () => {
    try {
      const dataToSend: Record<string, string> = {
        name: profileFormData.name,
        lastName: profileFormData.lastName,
        username: profileFormData.username,
        email: profileFormData.email,
        rut: profileFormData.rut || '',
        phone: profileFormData.phone || '',
        address: profileFormData.address || '',
        zipCode: profileFormData.zipCode || '',
        city: profileFormData.city || '',
        profession: profileFormData.profession || '',
        specialty: profileFormData.specialty || '',
      };

      await updateProfileMutation.mutateAsync(dataToSend);
      setIsEditing(false);
      showMessage('Información personal actualizada correctamente', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Error al actualizar el perfil', 'error');
    }
  };

  const userData = queryProfile.data;

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
                  RUT
                </label>
                <input
                  type="text"
                  name="rut"
                  value={profileFormData.rut}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                  disabled={isLoadingUpdate}
                  placeholder="12345678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profesión
                </label>
                <input
                  type="text"
                  name="profession"
                  value={profileFormData.profession}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                  disabled={isLoadingUpdate}
                  placeholder="Ej: Cirujano Dentista"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={profileFormData.specialty}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                  disabled={isLoadingUpdate}
                  placeholder="Ej: Odontología General"
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
                  <User className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">RUT</p>
                  <p className="font-medium text-slate-700">
                    {userData?.rut || 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <Briefcase className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Profesión</p>
                  <p className="font-medium text-slate-700">
                    {profileFormData.profession || 'No especificada'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <GraduationCap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Especialidad</p>
                  <p className="font-medium text-slate-700">
                    {profileFormData.specialty || 'No especificada'}
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
                  <Phone className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Teléfono</p>
                  <p className="font-medium text-slate-700">
                    {profileFormData.phone || 'No especificado'}
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
};

export { ProfileTab };