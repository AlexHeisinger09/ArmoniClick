import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { NewPassword } from "../pages/auth/NewPassword";
import { ConfirmAccount } from "../pages/auth/ConfirmAccount";

import { HomeLayout } from "../layouts/HomeLayout";
import { Home } from "../pages/home/Home";
import { Calendar } from "../pages/calendar/Calendar";
import { Patient } from "../pages/patient/Patient";
import { Configuration } from "../pages/configuration/Configuration";
import BudgetPage from "../pages/budgets/BudgetPage";
import DocumentsPage from "../pages/documents/DocumentsPage";

// ✅ NUEVAS IMPORTACIONES para confirmación/cancelación de citas
import  ConfirmAppointment  from "../pages/appointment/ConfirmAppointment";
import  CancelAppointment  from "../pages/appointment/CancelAppointment";
import { PublicAppointmentBooking } from "../pages/public/PublicAppointmentBooking";

export const router = createBrowserRouter([
  // Ruta raíz - Redirige al login
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

  // ✅ NUEVAS RUTAS PÚBLICAS para confirmación/cancelación de citas
  // Estas rutas NO requieren autenticación
  {
    path: "/confirm-appointment/:token",
    element: <ConfirmAppointment />,
  },
  {
    path: "/cancel-appointment/:token",
    element: <CancelAppointment />,
  },
  {
    path: "/book-appointment/:doctorId",
    element: <PublicAppointmentBooking />,
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
        element: <Home />, // PatientGrid
      },
      {
        path: "calendario",
        element: <Calendar />,
      },
      {
        path: "pacientes",
        element: <Patient />,
      },
      {
        path: "presupuestos",
        element: <BudgetPage />,
      },
      {
        path: "documentos",
        element: <DocumentsPage />,
      },
      {
        path: "configuracion",
        element: <Configuration />,
      },
    ],
  },
]);