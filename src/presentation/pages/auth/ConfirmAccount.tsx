import { TypographyH2 } from "@/presentation/components/shared/TypographyH2";
import { TypographyP } from "@/presentation/components/shared/TypographyP";

import { useConfirmAccount } from "@/presentation/hooks";

import { CheckCircle, Loader, UserCheck, AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export const ConfirmAccount = () => {
  const params = useParams();
  const { queryConfirmAccount } = useConfirmAccount(params.id as string);

  return (
    <div className="w-full p-6 sm:p-8 flex flex-col gap-6 max-w-md mx-auto">
      {/* Header estético */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          {queryConfirmAccount.isLoading ? (
            <Loader className="w-10 h-10 text-white animate-spin" />
          ) : queryConfirmAccount.data ? (
            <UserCheck className="w-10 h-10 text-white" />
          ) : (
            <AlertCircle className="w-10 h-10 text-white" />
          )}
        </div>
        
        <TypographyH2 className="text-slate-700 font-bold text-3xl mb-3">
          {queryConfirmAccount.isLoading 
            ? "Verificando cuenta..." 
            : queryConfirmAccount.data 
              ? "¡Cuenta verificada!" 
              : "Error de verificación"
          }
        </TypographyH2>
        
        <TypographyP className="text-slate-500 text-base">
          {queryConfirmAccount.isLoading 
            ? "Estamos confirmando tu registro, por favor espera un momento"
            : queryConfirmAccount.data 
              ? "Tu cuenta ha sido activada exitosamente. Ahora puedes acceder a todas las funcionalidades."
              : "Hubo un problema al verificar tu cuenta. El enlace puede haber expirado o ser inválido."
          }
        </TypographyP>
      </div>

      {/* Estado de carga */}
      {queryConfirmAccount.isLoading && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-spin">
              <Loader className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Validando cuenta...</p>
              <p className="text-sm text-slate-500">Este proceso puede tomar unos segundos</p>
            </div>
          </div>
          
          {/* Indicador de progreso */}
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de éxito */}
      {queryConfirmAccount.data && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-lg">¡Perfecto!</p>
                <p className="text-sm text-green-600">{queryConfirmAccount.data.message}</p>
              </div>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-2">¿Qué sigue ahora?</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>Accede con tu email y contraseña</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>Configura tu perfil profesional</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>Comienza a gestionar tus pacientes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {queryConfirmAccount.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-red-700 text-lg">Verificación fallida</p>
              <p className="text-sm text-red-600">{queryConfirmAccount.error.message}</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-red-700 mb-2">¿Qué puedes hacer?</h4>
            <ul className="text-sm text-red-600 space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Verifica que el enlace esté completo</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Solicita un nuevo email de confirmación</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>Contacta con soporte si persiste</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col space-y-3 pt-4">
        {queryConfirmAccount.data ? (
          /* Botón para ir al login cuando es exitoso */
          <Link
            to="/auth/login"
            className="
              w-full h-12 
              bg-gradient-to-r from-cyan-500 to-cyan-600 
              hover:from-cyan-600 hover:to-cyan-700 
              text-white font-semibold text-base
              rounded-xl shadow-sm
              transition-all duration-200 transform hover:scale-[1.02]
              flex items-center justify-center
              text-decoration-none
            "
          >
            <Home className="w-5 h-5 mr-2" />
            Iniciar sesión
          </Link>
        ) : (
          /* Botones cuando hay error o está cargando */
          <div className="space-y-3">
            <Link
              to="/auth/registrar"
              className="
                w-full h-12 
                bg-gradient-to-r from-cyan-500 to-cyan-600 
                hover:from-cyan-600 hover:to-cyan-700 
                text-white font-semibold text-base
                rounded-xl shadow-sm
                transition-all duration-200 transform hover:scale-[1.02]
                flex items-center justify-center
                text-decoration-none
              "
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Registrarse nuevamente
            </Link>
            
            <Link
              to="/auth/login"
              className="
                w-full h-12 
                bg-white border border-cyan-200
                hover:bg-cyan-50 
                text-slate-700 font-medium text-base
                rounded-xl 
                transition-all duration-200
                flex items-center justify-center
                text-decoration-none
              "
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al login
            </Link>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {!queryConfirmAccount.isLoading && (
        <div className="text-center pt-4 border-t border-cyan-200">
          <TypographyP className="text-slate-500 text-xs">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte técnico
          </TypographyP>
        </div>
      )}
    </div>
  );
};