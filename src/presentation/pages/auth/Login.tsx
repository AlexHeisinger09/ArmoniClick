import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, LogIn, Stethoscope } from "lucide-react";
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
    <div className="w-full flex flex-col gap-6">
      {/* Header simple sin animaciones */}
      <div className="text-center mb-2">
        <div className="w-25 h-25">
          <img
            src="/letras.PNG"
            alt="Logo ArmoniClick"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Título con color gris oscuro para contraste */}
        {/* <TypographyH2 className="text-slate-700 font-bold text-3xl mb-3">
          Iniciar Sesión
        </TypographyH2> */}
        {/* Subtítulo más discreto */}
        <TypographyP className="text-slate-500 text-base">
          Accede a tu cuenta y administra tus pacientes.
        </TypographyP>
      </div>

      {/* Mensaje de error global */}
      {loginMutation.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
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
                <FormLabel className="text-slate-700 font-semibold text-sm">
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                      placeholder="tu-email@ejemplo.com"
                      className={`
                        pl-11 pr-4 py-3 h-12 
                        border-2 border-slate-300 rounded-xl 
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
                <FormLabel className="text-slate-700 font-semibold text-sm">
                  Contraseña
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className={`
                        pl-11 pr-11 py-3 h-12 
                        border-2 border-slate-300 rounded-xl 
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

          <div className="text-right">
            <Link
              to="/auth/olvide-password"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón con fondo cyan y texto blanco */}
          <Button
            type="submit"
            disabled={isLoadingLogin}
            className="
              w-full h-12 
              bg-cyan-500 hover:bg-cyan-600 
              text-white font-bold text-base
              rounded-xl shadow-lg
              transition-all duration-200 transform hover:scale-[1.02]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center
              border-2 border-transparent
            "
          >
            {isLoadingLogin ? (
              <Spinner
                size="small"
                show={true}
                className="text-white"
              />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>

          <div className="text-center pt-4 border-t-2 border-slate-300">
            <TypographyP className="text-slate-500 text-sm font-medium">
              ¿No tienes cuenta?{" "}
              <Link
                to="/auth/registrar"
                className="text-cyan-600 font-bold hover:text-cyan-700 transition-colors hover:underline"
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