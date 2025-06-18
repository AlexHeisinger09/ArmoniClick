import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useState } from "react";

import { TypographyH2 } from "@/presentation/components/shared/TypographyH2";
import { TypographyP } from "@/presentation/components/shared/TypographyP";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";

import { loginSchema } from "@/presentation/validations/userSchema";
import { useLoginMutation } from "@/presentation/hooks";
import { Spinner } from "@/presentation/components/ui/spinner";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { loginMutation, isLoadingLogin } = useLoginMutation();

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutateAsync(values);
  }

  return (
    <div className="w-full p-6 sm:p-8 flex flex-col gap-6 max-w-md mx-auto">
      {/* Header estético */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-rosa rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <LogIn className="w-10 h-10 text-aesthetic-gris-profundo" />
        </div>
        <TypographyH2 className="text-aesthetic-gris-profundo font-bold text-3xl mb-3">
          Bienvenido de vuelta
        </TypographyH2>
        <TypographyP className="text-aesthetic-gris-medio text-base">
          Inicia sesión para gestionar tus pacientes y citas
        </TypographyP>
      </div>

      {/* Mensaje de error global */}
      {loginMutation.error && (
        <div className="bg-error/20 border border-error-foreground/20 text-error-foreground p-4 rounded-xl text-sm flex items-center">
          <div className="w-4 h-4 bg-error-foreground rounded-full mr-3 flex-shrink-0"></div>
          {loginMutation.error.message}
        </div>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                  Contraseña
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña segura"
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

          <div className="text-right">
            <Link 
              to="/auth/olvide-password" 
              className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo text-sm font-medium transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoadingLogin}
            className="
              w-full h-12 
              bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-rosa 
              hover:from-aesthetic-lavanda-hover hover:to-aesthetic-rosa-hover 
              text-aesthetic-gris-profundo font-semibold text-base
              rounded-xl shadow-sm
              transition-all duration-200 transform hover:scale-[1.02]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center
            "
          >
            {isLoadingLogin ? (
              <Spinner
                size="small"
                show={true}
                className="text-aesthetic-gris-profundo"
              />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>

          <div className="text-center pt-4 border-t border-aesthetic-lavanda/20">
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
        </form>
      </Form>
    </div>
  );
};