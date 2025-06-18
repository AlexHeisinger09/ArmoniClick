import {
  useChangePasswordMutation,
  useCheckUserToken,
} from "@/presentation/hooks";
import { useState } from "react";
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from "lucide-react";

import { TypographyH2 } from "@/presentation/components/shared/TypographyH2";
import { TypographyP } from "@/presentation/components/shared/TypographyP";

import { Button } from "@/presentation/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { Input } from "@/presentation/components/ui/input";
import { Alert, AlertTitle } from "@/presentation/components/ui/alert";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import { Spinner } from "@/presentation/components/ui/spinner";
import { newPasswordSchema } from "@/presentation/validations/userSchema";

import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const NewPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { queryCheckToken } = useCheckUserToken(params.token as string);
  const { changePasswordMutation, isLoadingChangePassword } = useChangePasswordMutation(
    params.token as string
  );

  const onSubmit = (values: z.infer<typeof newPasswordSchema>) => {
    changePasswordMutation.mutate({
      newPassword: values.password,
    });

    form.reset();
  };

  return (
    <div className="w-full p-6 sm:p-8 flex flex-col gap-6 max-w-md mx-auto">
      {/* Header estético */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-menta rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-aesthetic-gris-profundo" />
        </div>
        <TypographyH2 className="text-aesthetic-gris-profundo font-bold text-3xl mb-3">
          Nueva contraseña
        </TypographyH2>
        <TypographyP className="text-aesthetic-gris-medio text-base">
          Crea una contraseña segura para proteger tu cuenta
        </TypographyP>
      </div>

      {/* Mensaje de éxito */}
      {changePasswordMutation.data && (
        <Alert className="bg-success/20 border border-success-foreground/20 text-success-foreground rounded-xl flex items-center gap-3 py-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <AlertTitle className="m-0 font-medium">
            {changePasswordMutation.data.message}
          </AlertTitle>
        </Alert>
      )}

      {/* Mensaje de error */}
      {changePasswordMutation.error && (
        <Alert className="bg-error/20 border border-error-foreground/20 text-error-foreground rounded-xl flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <AlertTitle className="m-0 font-medium">
            {changePasswordMutation.error.message}
          </AlertTitle>
        </Alert>
      )}

      {/* Loading del token */}
      {queryCheckToken.isLoading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-aesthetic-lavanda/20 p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 bg-aesthetic-lavanda/30" />
              <Skeleton className="h-4 w-full bg-aesthetic-lavanda/30" />
              <Skeleton className="h-4 w-2/3 bg-aesthetic-lavanda/30" />
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-aesthetic-gris-medio">
              <Spinner size="small" show={true} className="text-aesthetic-gris-medio" />
              <span className="text-sm">Verificando enlace...</span>
            </div>
          </div>
        </div>
      ) : queryCheckToken.isError ? (
        /* Error del token */
        <div className="text-center space-y-4">
          <Alert className="bg-error/20 border border-error-foreground/20 text-error-foreground rounded-xl flex items-center gap-3 py-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="text-left">
              <AlertTitle className="m-0 font-medium mb-1">
                Enlace inválido o expirado
              </AlertTitle>
              <p className="text-sm opacity-90">
                {queryCheckToken.error.message}
              </p>
            </div>
          </Alert>
          <div className="bg-aesthetic-lavanda/20 border border-aesthetic-lavanda/30 p-4 rounded-xl">
            <p className="text-sm text-aesthetic-gris-profundo">
              <strong>¿Qué puedes hacer?</strong>
            </p>
            <ul className="text-xs text-aesthetic-gris-medio mt-2 space-y-1">
              <li>• Solicita un nuevo enlace de recuperación</li>
              <li>• Verifica que copiaste el enlace completo</li>
              <li>• Los enlaces expiran en 24 horas</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Formulario para nueva contraseña */
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                    Nueva Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        className={`
                          pl-11 pr-11 py-3 h-12 
                          border border-aesthetic-lavanda/30 rounded-xl 
                          focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent 
                          bg-white text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio
                          transition-all duration-200
                          ${errors.password?.message
                            ? "border-error-foreground/50 focus:ring-error-foreground/30"
                            : "hover:border-aesthetic-lavanda/50"
                          }
                        `}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-error-foreground text-xs" />
                </FormItem>
              )}
            />

            {/* Requisitos de contraseña */}
            <div className="bg-aesthetic-menta/20 border border-aesthetic-menta/30 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-aesthetic-gris-profundo mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Requisitos de seguridad
              </h4>
              <ul className="text-xs text-aesthetic-gris-medio space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-aesthetic-gris-medio rounded-full"></div>
                  <span>Mínimo 6 caracteres</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-aesthetic-gris-medio rounded-full"></div>
                  <span>Combina letras y números</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-aesthetic-gris-medio rounded-full"></div>
                  <span>Evita información personal</span>
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={changePasswordMutation.isSuccess || isLoadingChangePassword}
              className="
                w-full h-12 
                bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-menta 
                hover:from-aesthetic-lavanda-hover hover:to-aesthetic-menta-hover 
                text-aesthetic-gris-profundo font-semibold text-base
                rounded-xl shadow-sm
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center
              "
            >
              {isLoadingChangePassword ? (
                <Spinner
                  size="small"
                  show={true}
                  className="text-aesthetic-gris-profundo"
                />
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  {isLoadingChangePassword
                    ? "Guardando..."
                    : "Guardar nueva contraseña"}
                </>
              )}
            </Button>

            {/* Información de seguridad */}
            <div className="bg-aesthetic-lavanda/20 border border-aesthetic-lavanda/30 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-aesthetic-gris-profundo mt-0.5 flex-shrink-0" />
                <div className="text-sm text-aesthetic-gris-profundo">
                  <p className="font-medium mb-1">Mantén tu cuenta segura</p>
                  <p className="text-xs text-aesthetic-gris-medio">
                    Después de cambiar tu contraseña, serás redirigido al login para iniciar sesión con tus nuevas credenciales.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};