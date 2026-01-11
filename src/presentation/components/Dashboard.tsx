import { Calendar, Clock, ChevronLeft, ChevronRight, TrendingUp, Users, DollarSign, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { useProfile, useLoginMutation } from "@/presentation/hooks";
import { useWeeklyAppointments } from '@/presentation/hooks/appointments/useWeeklyAppointments';
import { useMonthlyPatients } from '@/presentation/hooks/patients/useMonthlyPatients';
import { useMonthlyRevenue } from '@/presentation/hooks/budgets/useMonthlyRevenue';
import { usePendingTreatmentsRevenue } from '@/presentation/hooks/budgets/usePendingTreatmentsRevenue';
import { useTodayAndUpcomingAppointments } from '@/presentation/hooks/appointments/useTodayAndUpcomingAppointments';
import { usePopularTreatments } from '@/presentation/hooks/budgets/usePopularTreatments';
import { useMonthlyRevenueHistory } from '@/presentation/hooks/budgets/useMonthlyRevenueHistory';
import { useRecentPatients } from '@/presentation/hooks/patients/useRecentPatients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardSkeleton from './DashboardSkeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  // Estado para carrusel de ingresos
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);

  // Hooks dinámicos para los 5 stats cards
  const { weeklyAppointmentsCount, isLoading: loadingWeekly } = useWeeklyAppointments();
  const { monthlyPatientsCount, percentageChange: patientsPercentageChange, isLoading: loadingMonthlyPatients } = useMonthlyPatients();
  const { currentMonthRevenueFormatted, percentageChange: revenuePercentageChange, isLoading: loadingRevenue } = useMonthlyRevenue();
  const { pendingRevenueFormatted, isLoading: loadingPending } = usePendingTreatmentsRevenue();

  // Hooks dinámicos para los 4 componentes
  const { upcomingAppointments, isLoading: loadingUpcoming } = useTodayAndUpcomingAppointments();
  const { treatmentsData, isEmpty: treatmentsEmpty, isLoading: loadingTreatments } = usePopularTreatments();
  const { allMonthlyData, getSemesterData, isLoading: loadingMonthlyHistory } = useMonthlyRevenueHistory();
  const { recentPatients: recentPatientsData, isLoading: loadingRecentPatients } = useRecentPatients();

  // Verificar si las secciones lentas están cargando (sin incluir los stats cards que son rápidos)
  const isLoadingContent = loadingUpcoming || loadingTreatments || loadingMonthlyHistory || loadingRecentPatients;

  // Datos del carrusel de ingresos (6 meses)
  const currentSemesterData = getSemesterData(currentSemesterIndex);

  // ✅ NUEVO: Calcular el máximo de ingresos de todos los 12 meses para usar como dominio fijo en eje Y
  const maxRevenueAllMonths = Math.max(
    ...allMonthlyData.map(m => m.ingresos),
    450000 // Valor mínimo por defecto para una escala consistente
  );

  // Redondear hacia arriba al próximo 50K para una escala limpia
  const yAxisDomain = Math.ceil(maxRevenueAllMonths / 50000) * 50000;

  // ✅ NUEVO: Carrusel automático que cambia cada 5 segundos con animación
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSemesterIndex((prev) => (prev + 1) % 2);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleNextSemester = () => {
    setCurrentSemesterIndex((prev) => (prev + 1) % 2);
  };

  const handlePrevSemester = () => {
    setCurrentSemesterIndex((prev) => (prev - 1 + 2) % 2);
  };

  // Navegar al perfil del paciente
  const handleNavigateToPatient = (patientId: number) => {
    if (patientId) {
      navigate(`/dashboard/pacientes?id=${patientId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-clinic-500 text-white';
      case 'pending': return 'bg-amber-400 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'no-show': return 'bg-orange-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'no-show': return 'No asistió';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'border-amber-400 bg-amber-50 text-amber-800';
      case 'danger': return 'border-red-400 bg-red-50 text-red-800';
      case 'info': return 'border-clinic-400 bg-clinic-50 text-clinic-800';
      default: return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  // Mostrar skeleton mientras carga el contenido principal (sin los stats cards)
  if (isLoadingContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards - Siempre visibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-r from-clinic-500 to-clinic-600 text-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Esta Semana</CardTitle>
                <Calendar className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyAppointmentsCount}</div>
                <p className="text-xs opacity-90">Semana en curso</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-clinic-400 to-clinic-500 text-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Este Mes</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyPatientsCount}</div>
                <p className="text-xs opacity-90">{patientsPercentageChange > 0 ? '+' : ''}{patientsPercentageChange}% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-clinic-600 to-clinic-700 text-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthRevenueFormatted}</div>
                <p className="text-xs opacity-90">{revenuePercentageChange > 0 ? '+' : ''}{revenuePercentageChange}% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dinero Pendiente</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRevenueFormatted}</div>
                <p className="text-xs opacity-90">Potencial de ingresos futuros</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-clinic-300 to-clinic-400 text-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs opacity-90">Basado en 156 reseñas</p>
              </CardContent>
            </Card>
          </div>

          {/* Skeleton para el contenido que está cargando */}
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clinic-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-clinic-500 to-clinic-600 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Esta Semana</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyAppointmentsCount}</div>
              <p className="text-xs opacity-90">Semana en curso</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-400 to-clinic-500 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Este Mes</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyPatientsCount}</div>
              <p className="text-xs opacity-90">{patientsPercentageChange > 0 ? '+' : ''}{patientsPercentageChange}% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-600 to-clinic-700 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonthRevenueFormatted}</div>
              <p className="text-xs opacity-90">{revenuePercentageChange > 0 ? '+' : ''}{revenuePercentageChange}% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dinero Pendiente</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRevenueFormatted}</div>
              <p className="text-xs opacity-90">Potencial de ingresos futuros</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-300 to-clinic-400 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs opacity-90">Basado en 156 reseñas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">

          {/* Próximas Citas */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="flex items-center text-clinic-800">
                <Clock className="w-5 h-5 mr-2" />
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-clinic-50 to-transparent rounded-lg border border-clinic-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="text-clinic-700 font-semibold text-lg">
                            {appointment.time}
                          </div>
                          <div className="text-xs text-clinic-600 font-medium">
                            {appointment.date}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{appointment.patient}</div>
                          <div className="text-sm text-clinic-600">{appointment.treatment}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No hay próximas citas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tratamientos Populares */}
          <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="text-clinic-800">Tratamientos Populares</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {treatmentsEmpty ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Sin datos de tratamientos</p>
                </div>
              ) : (
                <>
                  <div className="bg-white">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={treatmentsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          label={false}
                        >
                          {treatmentsData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                              const data = payload[0].payload;
                              return (
                                <div
                                  style={{
                                    backgroundColor: '#3f4a5a',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#17c1e8',
                                    padding: '8px 12px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <p style={{ margin: 0, fontWeight: 500 }}>{data.name}</p>
                                  <p style={{ margin: '4px 0 0 0' }}>{data.value}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2 bg-white">
                    {treatmentsData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico de Ingresos Mensuales - Carrusel */}
          <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-clinic-800">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Ingreso Mensual
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSemester}
                    className="p-1 hover:bg-clinic-100 rounded transition-colors"
                    title="Meses anteriores"
                  >
                    <ChevronLeft className="w-5 h-5 text-clinic-600" />
                  </button>
                  <span className="text-xs font-medium text-gray-600 w-16 text-center">
                    {currentSemesterIndex === 0 ? 'Ene-Jun' : 'Jul-Dic'}
                  </span>
                  <button
                    onClick={handleNextSemester}
                    className="p-1 hover:bg-clinic-100 rounded transition-colors"
                    title="Próximos meses"
                  >
                    <ChevronRight className="w-5 h-5 text-clinic-600" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white overflow-hidden">
              <div
                key={currentSemesterIndex}
                className="animate-slide-in"
                style={{
                  animation: 'slideInFromLeft 0.6s ease-in-out'
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentSemesterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f7fa" />
                  <XAxis dataKey="name" stroke="#0e7490" />
                  <YAxis
                    stroke="#0e7490"
                    domain={[0, yAxisDomain]}
                    tickFormatter={(value) => {
                      // ✅ Formatear los valores del eje Y a escala (K para miles, M para millones)
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(0)}M`;
                      }
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}K`;
                      }
                      return `$${value}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#3f4a5a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#17c1e8',
                      padding: '8px 12px'
                    }}
                    formatter={(value) => `$${value.toLocaleString('es-CL')}`}
                    labelFormatter={() => ''}
                    cursor={{ fill: 'rgba(23, 193, 232, 0.1)' }}
                  />
                  <Bar dataKey="ingresos" fill="#17c1e8" radius={4} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pacientes Recientes */}
          <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="flex items-center text-clinic-800">
                <Users className="w-5 h-5 mr-2" />
                Pacientes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {recentPatientsData.length > 0 ? (
                  recentPatientsData.map((patient, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigateToPatient(patient.id)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-clinic-50 to-transparent rounded-lg border border-clinic-200 hover:shadow-md hover:bg-clinic-50/50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-clinic-400 to-clinic-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {patient.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-clinic-600">
                              Registrado hace {getRelativeTime(patient.registrationDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < 4.5
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-yellow-200 text-yellow-200'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">4.5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-clinic-500 ml-2">
                        →
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Sin pacientes registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper para obtener tiempo relativo en español
 * Ejemplo: "2 días", "1 semana", "3 meses"
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return '1 día';
  if (diffDays < 7) return `${diffDays} días`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 semana';
  if (diffWeeks < 4) return `${diffWeeks} semanas`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 mes';
  return `${diffMonths} meses`;
}

export default Dashboard;