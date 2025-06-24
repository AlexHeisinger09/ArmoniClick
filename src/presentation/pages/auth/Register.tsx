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
        <div className="w-25 h-25">
          <img
            src="/letras.PNG"
            alt="Logo ArmoniClick"
            className="w-full h-full object-contain"
          />
          </div>
        {/* <TypographyH2 className="text-slate-700 font-bold text-3xl mb-3">
          Crea tu cuenta
        </TypographyH2> */}
        <TypographyP className="text-slate-500 text-base">
          Únete a nuestra plataforma y comienza a gestionar tus pacientes
        </TypographyP>
      </div>

      {/* Mensaje de éxito */}
      {registerMutation.data && (
        <Alert className="bg-green-50 border border-green-200 text-green-700 rounded-xl">
          <Check className="w-5 h-5" />
          <AlertTitle className="ml-2 font-medium">
            {registerMutation.data.message}
          </AlertTitle>
        </Alert>
      )}

      {/* Mensaje de error global */}
      {registerMutation.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
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
                  <FormLabel className="text-slate-700 font-medium text-sm">
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input
                        placeholder="Juan"
                        className={`
                          pl-10 pr-4 py-3 h-11
                          border border-cyan-200 rounded-xl 
                          focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                          bg-white text-slate-700 placeholder-slate-600 placeholder:text-slate-500
                          transition-all duration-200
                          ${errors.name?.message
                            ? "border-red-400 focus:ring-red-300"
                            : "hover:border-cyan-400"
                          }
                        `}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium text-sm">
                    Apellido
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pérez"
                      className={`
                        px-4 py-3 h-11
                        border border-cyan-200 rounded-xl 
                        focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                        bg-white text-slate-700 placeholder-slate-600 placeholder:text-slate-500
                        transition-all duration-200
                        ${errors.lastName?.message
                          ? "border-red-400 focus:ring-red-300"
                          : "hover:border-cyan-400"
                        }
                      `}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium text-sm">
                  Nombre de usuario
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                      placeholder="juanperez"
                      className={`
                        pl-11 pr-4 py-3 h-12
                        border border-cyan-200 rounded-xl 
                        focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                        bg-white text-slate-700 placeholder-slate-600 placeholder:text-slate-500
                        transition-all duration-200
                        ${errors.username?.message
                          ? "border-red-400 focus:ring-red-300"
                          : "hover:border-cyan-400"
                        }
                      `}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium text-sm">
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                      placeholder="juan@ejemplo.com"
                      className={`
                        pl-11 pr-4 py-3 h-12
                        border border-cyan-200 rounded-xl 
                        focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                        bg-white text-slate-700 placeholder-slate-600 placeholder:text-slate-500
                        transition-all duration-200
                        ${errors.email?.message
                          ? "border-red-400 focus:ring-red-300"
                          : "hover:border-cyan-400"
                        }
                      `}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium text-sm">
                  Contraseña
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      className={`
                        pl-11 pr-11 py-3 h-12
                        border border-cyan-200 rounded-xl 
                        focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                        bg-white text-slate-700 placeholder-slate-600 placeholder:text-slate-500
                        transition-all duration-200
                        ${errors.password?.message
                          ? "border-red-400 focus:ring-red-300"
                          : "hover:border-cyan-400"
                        }
                      `}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 text-xs" />
              </FormItem>
            )}
          />

          <div className="text-right mt-2">
            <Link 
              to="/auth/olvide-password" 
              className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={registerMutation.isSuccess || isLoadingRegister}
            className="
              w-full h-12 mt-2
              bg-gradient-to-r from-cyan-500 to-cyan-600 
              hover:from-cyan-600 hover:to-cyan-700 
              text-white font-semibold text-base
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
                className="text-white"
              />
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {isLoadingRegister ? "Creando cuenta..." : "Crear cuenta"}
              </>
            )}
          </Button>

          <div className="text-center pt-4 border-t border-cyan-200">
            <TypographyP className="text-slate-500 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/auth/login"
                className="text-slate-700 font-semibold hover:text-slate-900 transition-colors hover:underline"
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