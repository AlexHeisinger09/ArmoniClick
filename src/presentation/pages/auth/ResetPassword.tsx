import { useResetPasswordMutation } from "@/presentation/hooks";
import { Mail, Key, AlertCircle, CheckCircle } from "lucide-react";

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
import { Spinner } from "@/presentation/components/ui/spinner";
import { resetPasswordSchema } from "@/presentation/validations/userSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

export const ResetPassword = () => {
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { resetPasswordMutation, isLoadingResetPassword } =
    useResetPasswordMutation();

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    resetPasswordMutation.mutate(values);
  };

  return (
    <div className="w-full p-6 sm:p-8 flex flex-col gap-6 max-w-md mx-auto">
      {/* Header estético */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-gradient-to-r from-aesthetic-rosa to-aesthetic-menta rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <Key className="w-10 h-10 text-aesthetic-gris-profundo" />
        </div>
        <TypographyH2 className="text-aesthetic-gris-profundo font-bold text-3xl mb-3">
          Recuperar contraseña
        </TypographyH2>
        <TypographyP className="text-aesthetic-gris-medio text-base">
          Te enviaremos un enlace para restablecer tu contraseña de forma segura
        </TypographyP>
      </div>

      {/* Mensaje de éxito */}
      {resetPasswordMutation.data && (
        <Alert className="bg-success/20 border border-success-foreground/20 text-success-foreground rounded-xl flex items-center gap-3 py-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <AlertTitle className="m-0 font-medium">
            {resetPasswordMutation.data.message}
          </AlertTitle>
        </Alert>
      )}

      {/* Mensaje de error */}
      {resetPasswordMutation.error && (
        <Alert className="bg-error/20 border border-error-foreground/20 text-error-foreground rounded-xl flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <AlertTitle className="m-0 font-medium">
            {resetPasswordMutation.error.message}
          </AlertTitle>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
                    <Input
                      placeholder="tu-email@ejemplo.com"
                      className={`
                        pl-11 pr-4 py-3 h-12 
                        border border-aesthetic-lavanda/30 rounded-xl 
                        focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent 
                        bg-white text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio
                        transition-all duration-200
                        ${errors.email?.message
                          ? "border-error-foreground/50 focus:ring-error-foreground/30"
                          : "hover:border-aesthetic-lavanda/50"
                        }
                      `}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-error-foreground text-xs" />
              </FormItem>
            )}
          />

          {/* Información adicional */}
          <div className="bg-aesthetic-lavanda/20 border border-aesthetic-lavanda/30 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-aesthetic-gris-profundo mt-0.5 flex-shrink-0" />
              <div className="text-sm text-aesthetic-gris-profundo">
                <p className="font-medium mb-1">¿Cómo funciona?</p>
                <ul className="text-xs text-aesthetic-gris-medio space-y-1">
                  <li>• Recibirás un email con un enlace seguro</li>
                  <li>• El enlace expira en 24 horas</li>
                  <li>• Podrás crear una nueva contraseña</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={resetPasswordMutation.isSuccess || isLoadingResetPassword}
            className="
              w-full h-12 
              bg-gradient-to-r from-aesthetic-rosa to-aesthetic-menta 
              hover:from-aesthetic-rosa-hover hover:to-aesthetic-menta-hover 
              text-aesthetic-gris-profundo font-semibold text-base
              rounded-xl shadow-sm
              transition-all duration-200 transform hover:scale-[1.02]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center
            "
          >
            {isLoadingResetPassword ? (
              <Spinner
                size="small"
                show={true}
                className="text-aesthetic-gris-profundo"
              />
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                {isLoadingResetPassword ? "Enviando..." : "Enviar enlace"}
              </>
            )}
          </Button>

          <div className="flex flex-col space-y-3 pt-4 border-t border-aesthetic-lavanda/20">
            <div className="text-center">
              <TypographyP className="text-aesthetic-gris-medio text-sm">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  to="/auth/login"
                  className="text-aesthetic-gris-profundo font-semibold hover:text-aesthetic-gris-profundo/80 transition-colors hover:underline"
                >
                  Iniciar sesión
                </Link>
              </TypographyP>
            </div>

            <div className="text-center">
              <TypographyP className="text-aesthetic-gris-medio text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/auth/registrar"
                  className="text-aesthetic-gris-profundo font-semibold hover:text-aesthetic-gris-profundo/80 transition-colors hover:underline"
                >
                  Crear cuenta
                </Link>
              </TypographyP>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};