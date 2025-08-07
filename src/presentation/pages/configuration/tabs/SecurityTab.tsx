// src/presentation/pages/configuration/tabs/SecurityTab.tsx
import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useUpdatePasswordMutation } from "@/presentation/hooks/user/useUpdateProfile";
import { Spinner } from "@/presentation/components/ui/spinner";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ showMessage }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { updatePasswordMutation, isLoadingPasswordUpdate } = useUpdatePasswordMutation();

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
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
};

export { SecurityTab };