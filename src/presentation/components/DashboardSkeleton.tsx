import React from 'react';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import Skeleton from '@/presentation/components/ui/skeleton/Skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <>
      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-transparent">

          {/* Próximas Citas Skeleton */}
          <Card className="lg:col-span-2 bg-white">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center">
                <Skeleton variant="circular" width={20} height={20} className="mr-2" />
                <Skeleton width={120} height={20} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex flex-col items-center">
                      <Skeleton width={60} height={20} className="mb-1" />
                      <Skeleton width={80} height={12} />
                    </div>
                    <div className="flex-1">
                      <Skeleton width={150} height={16} className="mb-2" />
                      <Skeleton width={120} height={12} />
                    </div>
                  </div>
                  <Skeleton width={80} height={24} className="rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tratamientos Populares Skeleton */}
          <Card className="bg-white">
            <CardHeader className="bg-slate-50">
              <Skeleton width={160} height={20} />
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {/* Gráfico circular skeleton */}
              <div className="flex justify-center mb-4">
                <Skeleton variant="circular" width={160} height={160} />
              </div>
              {/* Leyenda skeleton */}
              <div className="space-y-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton variant="circular" width={12} height={12} />
                      <Skeleton width={100} height={12} />
                    </div>
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico de Ingresos Skeleton */}
          <Card className="bg-white">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton variant="circular" width={20} height={20} className="mr-2" />
                  <Skeleton width={120} height={20} />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton width={60} height={12} />
                  <Skeleton variant="circular" width={24} height={24} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {/* Gráfico de barras skeleton */}
              <div className="h-[300px] flex items-end justify-between gap-4">
                {[...Array(6)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex-1"
                    height={Math.random() * 200 + 100}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pacientes Recientes Skeleton */}
          <Card className="bg-white">
            <CardHeader className="bg-slate-50">
              <div className="flex items-center">
                <Skeleton variant="circular" width={20} height={20} className="mr-2" />
                <Skeleton width={140} height={20} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-4 flex-1">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1">
                      <Skeleton width={150} height={16} className="mb-2" />
                      <Skeleton width={120} height={12} />
                    </div>
                  </div>
                  <Skeleton width={20} height={20} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
    </>
  );
};

export default DashboardSkeleton;
