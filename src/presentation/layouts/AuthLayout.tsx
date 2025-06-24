import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos decorativos grandes */}
        <div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)'
          }}
        />
        
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)'
          }}
        />
        
        {/* Círculos medianos */}
        <div 
          className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 60%, transparent 100%)'
          }}
        />
        
        <div 
          className="absolute bottom-1/3 left-1/4 w-32 h-32 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 60%, transparent 100%)'
          }}
        />
        
        {/* Burbujas estáticas adicionales */}
        <div className="absolute top-1/6 left-1/6 w-24 h-24 rounded-full bg-white/20"></div>
        <div className="absolute top-1/2 left-1/12 w-16 h-16 rounded-full bg-white/15"></div>
        <div className="absolute top-3/4 left-1/3 w-12 h-12 rounded-full bg-white/25"></div>
        <div className="absolute top-1/5 right-1/6 w-20 h-20 rounded-full bg-white/18"></div>
        <div className="absolute top-2/3 right-1/5 w-14 h-14 rounded-full bg-white/22"></div>
        <div className="absolute bottom-1/6 right-1/3 w-18 h-18 rounded-full bg-white/20"></div>
        <div className="absolute top-1/3 left-1/2 w-10 h-10 rounded-full bg-white/30"></div>
        <div className="absolute bottom-1/4 left-2/3 w-8 h-8 rounded-full bg-white/25"></div>
        <div className="absolute top-4/5 right-2/3 w-6 h-6 rounded-full bg-white/35"></div>
        <div className="absolute top-1/12 left-3/4 w-12 h-12 rounded-full bg-white/20"></div>
        <div className="absolute bottom-1/8 right-1/12 w-10 h-10 rounded-full bg-white/18"></div>
        <div className="absolute top-2/5 right-1/2 w-14 h-14 rounded-full bg-white/16"></div>
        
        {/* Círculos pequeños existentes */}
        <div 
          className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }}
        />
        
        <div 
          className="absolute top-2/3 right-1/3 w-20 h-20 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }}
        />
      </div>

      {/* Contenedor principal del formulario - MÁS ANCHO */}
      <section className="relative z-10 w-full max-w-lg mx-auto px-4">
        <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-10">
          <Outlet />
        </div>
      </section>
    </main>
  );
};