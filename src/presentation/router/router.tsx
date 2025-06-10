import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { NewPassword } from "../pages/auth/NewPassword";
import { ConfirmAccount } from "../pages/auth/ConfirmAccount";

import { HomeLayout } from "../layouts/HomeLayout";
import { Home } from "../pages/home/Home";
import { Calendar }  from "../pages/calendar/Calendar";
import { Patient }  from "../pages/patient/Patient";
import { Configuration }  from "../pages/configuration/Configuration";

export const router = createBrowserRouter([
  // Ruta raíz - Login (sin AuthLayout específico)
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  
  // Rutas de autenticación con prefijo /auth y AuthLayout
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "registrar",
        element: <Register />,
      },
      {
        path: "olvide-password",
        element: <ResetPassword />,
      },
      {
        path: "olvide-password/:token",
        element: <NewPassword />,
      },
      {
        path: "confirmar/:id",
        element: <ConfirmAccount />,
      },
    ],
  },
  
  // Rutas protegidas con HomeLayout
  {
    path: "/dashboard",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  
  {
    path: "/calendario",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Calendar />,
      },
    ],
  },
  
  {
    path: "/pacientes",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Patient />,
      },
    ],
  },
  
  {
    path: "/configuracion",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Configuration />,
      },
    ],
  },
]);