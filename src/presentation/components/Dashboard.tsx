import { Calendar, Clock, Bell, TrendingUp, Users, DollarSign, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Alert, AlertDescription } from '@/presentation/components/ui/alert';
import { useProfile, useLoginMutation } from "@/presentation/hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  // Datos de ejemplo
  const todayAppointments = [
    { id: 1, time: '09:00', patient: 'María González', treatment: 'Botox', status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'Ana López', treatment: 'Limpieza Facial', status: 'pending' },
    { id: 3, time: '14:00', patient: 'Carmen Ruiz', treatment: 'Rellenos', status: 'confirmed' },
    { id: 4, time: '15:30', patient: 'Laura Martín', treatment: 'Láser', status: 'confirmed' },
  ];

  const monthlyData = [
    { name: 'Ene', citas: 45, ingresos: 12000 },
    { name: 'Feb', citas: 52, ingresos: 14500 },
    { name: 'Mar', citas: 48, ingresos: 13200 },
    { name: 'Abr', citas: 61, ingresos: 16800 },
    { name: 'May', citas: 67, ingresos: 18200 },
    { name: 'Jun', citas: 59, ingresos: 17100 },
  ];

  const treatmentData = [
    { name: 'Botox', value: 35, color: '#21d4fd' },
    { name: 'Rellenos', value: 25, color: '#17c1e8' },
    { name: 'Limpieza', value: 20, color: '#67e8f9' },
    { name: 'Láser', value: 20, color: '#08a1c4' },
  ];

  const recentPatients = [
    { name: 'Elena Castro', lastVisit: '2 días', treatment: 'Botox', satisfaction: 5 },
    { name: 'Patricia Díaz', lastVisit: '1 semana', treatment: 'Rellenos', satisfaction: 5 },
    { name: 'Rosa García', lastVisit: '3 días', treatment: 'Limpieza', satisfaction: 4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-clinic-500 text-white';
      case 'pending': return 'bg-amber-400 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-400 text-white';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-clinic-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-clinic-500 to-clinic-600 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs opacity-90">+2 desde ayer</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-400 to-clinic-500 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Este Mes</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs opacity-90">+12% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-600 to-clinic-700 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€17,100</div>
              <p className="text-xs opacity-90">+8% vs objetivo</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-clinic-300 to-clinic-400 text-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs opacity-90">Basado en 156 reseñas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">

          {/* Citas de Hoy */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="flex items-center text-clinic-800">
                <Clock className="w-5 h-5 mr-2" />
                Citas de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-clinic-50 to-transparent rounded-lg border border-clinic-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="text-clinic-700 font-semibold text-lg">
                        {appointment.time}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{appointment.patient}</div>
                        <div className="text-sm text-clinic-600">{appointment.treatment}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tratamientos Populares */}
          <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="text-clinic-800">Tratamientos Populares</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="bg-white"> {/* Cambié style por className */}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={treatmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {treatmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 bg-white"> {/* Añadí bg-white aquí */}
                {treatmentData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico de Citas Mensuales */}
          <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-clinic-50 to-clinic-100">
              <CardTitle className="flex items-center text-clinic-800">
                <TrendingUp className="w-5 h-5 mr-2" />
                Ingreso Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-p-6 bg-white">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f7fa" />
                  <XAxis dataKey="name" stroke="#0e7490" />
                  <YAxis stroke="#0e7490" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ecfeff',
                      border: '1px solid #17c1e8',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="citas" fill="#17c1e8" radius={4} />
                </BarChart>
              </ResponsiveContainer>
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
                {recentPatients.map((patient, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-clinic-50 to-transparent rounded-lg border border-clinic-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-clinic-400 to-clinic-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-clinic-600">{patient.treatment} • Hace {patient.lastVisit}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < patient.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;