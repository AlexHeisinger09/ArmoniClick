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

const authRoutes = [
  {
    to: "/",
    component: <Login />,
  },
  {
    to: "/registrar",
    component: <Register />,
  },
  {
    to: "/olvide-password",
    component: <ResetPassword />,
  },
  {
    to: "/olvide-password/:token",
    component: <NewPassword />,
  },
  {
    to: "/confirmar/:id",
    component: <ConfirmAccount />,
  },
];

const homeRoutes = [
  {
    to: "/dashboard",
    component: <Home />,
  },
  {
    to: "/calendario",
    component: <Calendar />,
  },
  {
     to: "/pacientes",
     component: <Patient />,
   },
   {
     to: "/configuracion",
     component: <Configuration />,
   },
];

export const router = createBrowserRouter([
  // Rutas de autenticación con AuthLayout (incluye login en raíz)
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      ...authRoutes.map((route) => ({
        path: route.to,
        element: route.component,
        ...(route.to === "/" && { index: true }) // Hace que Login sea la ruta index
      })),
    ],
  },
  
  // Rutas protegidas con HomeLayout
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      ...homeRoutes.map((route) => ({
        path: route.to,
        element: route.component,
      })),
    ],
  },
]);