import { useRegisterMutation } from "@/presentation/hooks";

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
import { MailCheck } from "lucide-react";

export const Register = () => {
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
    <div className="w-full p-4 sm:p-8 flex flex-col gap-4">
      <TypographyH2 className="uppercase text-center">
        Crea tu cuenta
      </TypographyH2>
      <TypographyP className="text-center">
        Crea tu cuenta y administra tus pacientes
      </TypographyP>

      {registerMutation.data && (
        <Alert variant="success">
          <MailCheck />
          <AlertTitle className="ml-2">
            {registerMutation.data.message}
          </AlertTitle>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jon"
                    className={`border ${
                      errors.name?.message
                        ? "border-red-500"
                        : "border-blue-600"
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    className={`border ${
                      errors.name?.message
                        ? "border-red-500"
                        : "border-blue-600"
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input
                    placeholder="jondoe"
                    className={`border ${
                      errors.name?.message
                        ? "border-red-500"
                        : "border-blue-600"
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@gmail.com"
                    className={`border ${
                      errors.email?.message
                        ? "border-red-500"
                        : "border-blue-600"
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="**********"
                    className={`border ${
                      errors.password?.message
                        ? "border-red-500"
                        : "border-blue-600"
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage>
                  {registerMutation && registerMutation.error?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <Link to="/auth/olvide-password" className="text-[#366EFF] text-md">
            ¿Olvidaste tu contraseña?
          </Link>

          <Button
            type="submit"
            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            variant="blue"
            disabled={registerMutation.isSuccess}
          >
            <Spinner
              size="small"
              show={isLoadingRegister}
              className="text-slate-300"
            />
            {isLoadingRegister ? "Creando cuenta..." : "Registrarse"}
          </Button>

          <TypographyP className="text-md">
            ¿Ya tienes cuenta?
            <Link to="/auth/login" className="text-[#366EFF] ml-2 font-medium">
              Inicia Sesión
            </Link>
          </TypographyP>
        </form>
      </Form>
    </div>
  );
};
