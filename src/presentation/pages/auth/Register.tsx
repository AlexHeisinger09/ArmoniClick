import { useRegisterMutation } from "@/presentation/hooks";
import { useState } from "react";
import { Eye, EyeOff, User, Mail, UserPlus, Check } from "lucide-react";

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
import { TypographyH2 } from "@/presentation/components/shared/TypographyH2";
import { TypographyP } from "@/presentation/components/shared/TypographyP";
import { Alert, AlertTitle } from "@/presentation/components/ui/alert";
import { Spinner } from "@/presentation/components/ui/spinner";

import { registerSchema } from "@/presentation/validations/userSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const { registerMutation, isLoadingRegister } = useRegisterMutation();
  
  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutateAsync(values);
  }

  return (
    <div className="w-full p-6 sm:p-8 flex flex-col gap-6 max-w-md mx-auto">
      {/* Header estético */}
      <div className="text-center mb-2">
        <div className="w-20 h-20 bg-gradient-to-r from-aesthetic-menta to-aesthetic-lavanda rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <UserPlus className="w-10 h-10 text-aesthetic-gris-profundo" />
        </div>
        <TypographyH2 className="text-aesthetic-gris-profundo font-bold text-3xl mb-3">
          Crea tu cuenta
        </TypographyH2>
        <TypographyP className="text-aesthetic-gris-medio text-base">
          Únete a nuestra plataforma y comienza a gestionar tus pacientes
        </TypographyP>
      </div>

      {/* Mensaje de éxito */}
      {registerMutation.data && (
        <Alert className="bg-success/20 border border-success-foreground/20 text-success-foreground rounded-xl">
          <Check className="w-5 h-5" />
          <AlertTitle className="ml-2 font-medium">
            {registerMutation.data.message}
          </AlertTitle>
        </Alert>
      )}

      {/* Mensaje de error global */}
      {registerMutation.error && (
        <div className="bg-error/20 border border-error-foreground/20 text-error-foreground p-4 rounded-xl text-sm flex items-center">
          <div className="w-4 h-4 bg-error-foreground rounded-full mr-3 flex-shrink-0"></div>
          {registerMutation.error.message}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-4 h-4" />
                      <Input
                        placeholder="Juan"
                        className={`
                          pl-10 pr-4 py-3 h-11
                          border border-aesthetic-lavanda/30 rounded-xl 
                          focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent 
                          bg-white text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio
                          transition-all duration-200
                          ${errors.name?.message
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
              name="lastName"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                    Apellido
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pérez"
                      className={`
                        px-4 py-3 h-11
                        border border-aesthetic-lavanda/30 rounded-xl 
                        focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent 
                        bg-white text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio
                        transition-all duration-200
                        ${errors.lastName?.message
                          ? "border-error-foreground/50 focus:ring-error-foreground/30"
                          : "hover:border-aesthetic-lavanda/50"
                        }
                      `}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-error-foreground text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-aesthetic-gris-profundo font-medium text-sm">
                  Nombre de usuario
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
                    <Input
                      placeholder="juanperez"
                      className={`
                        pl-11 pr-4 py-3 h-12
                        border border-aesthetic-lavanda/30 rounded-xl 
                        focus:ring-2 focus:ring-aesthetic-lavanda focus:border-transparent 
                        bg-white text-aesthetic-gris-profundo placeholder-aesthetic-gris-medio
                        transition-all duration-200
                        ${errors.username?.message
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
                      placeholder="juan@ejemplo.com"
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
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aesthetic-gris-medio w-5 h-5" />
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

          <div className="text-right mt-2">
            <Link 
              to="/auth/olvide-password" 
              className="text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo text-sm font-medium transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={registerMutation.isSuccess || isLoadingRegister}
            className="
              w-full h-12 mt-2
              bg-gradient-to-r from-aesthetic-menta to-aesthetic-lavanda 
              hover:from-aesthetic-menta-hover hover:to-aesthetic-lavanda-hover 
              text-aesthetic-gris-profundo font-semibold text-base
              rounded-xl shadow-sm
              transition-all duration-200 transform hover:scale-[1.02]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center
            "
          >
            {isLoadingRegister ? (
              <Spinner
                size="small"
                show={true}
                className="text-aesthetic-gris-profundo"
              />
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {isLoadingRegister ? "Creando cuenta..." : "Crear cuenta"}
              </>
            )}
          </Button>

          <div className="text-center pt-4 border-t border-aesthetic-lavanda/20">
            <TypographyP className="text-aesthetic-gris-medio text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/auth/login"
                className="text-aesthetic-gris-profundo font-semibold hover:text-aesthetic-gris-profundo/80 transition-colors hover:underline"
              >
                Iniciar sesión
              </Link>
            </TypographyP>
          </div>
        </form>
      </Form>
    </div>
  );
};