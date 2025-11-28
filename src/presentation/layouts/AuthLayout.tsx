import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo gradiente - solo visible en móvil */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600">
        {/* Elementos decorativos de fondo para móvil */}
        <div className="absolute inset-0 overflow-hidden">
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
        </div>
      </div>

      {/* Contenedor principal - dos columnas en desktop */}
      <section className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* Columna izquierda - Login (fondo beige) */}
        <div className="w-full md:w-1/2 flex items-center md:items-start justify-center md:pt-20 p-4 md:p-8 min-h-screen md:min-h-screen bg-[#F2F1E7] relative overflow-hidden">
          {/* Burbujas decorativas en fondo beige */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full shadow-lg" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.6), rgba(34, 211, 238, 0.2))' }}></div>
            <div className="absolute top-1/3 left-5 w-20 h-20 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.5), rgba(34, 211, 238, 0.15))' }}></div>
            <div className="absolute bottom-20 right-1/4 w-24 h-24 rounded-full shadow-lg" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.18))' }}></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.6), rgba(34, 211, 238, 0.2))' }}></div>
            <div className="absolute top-1/2 right-1/3 w-14 h-14 rounded-full shadow-sm" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.5), rgba(34, 211, 238, 0.12))' }}></div>
            <div className="absolute top-20 left-1/4 w-12 h-12 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.15))' }}></div>
          </div>
          <div className="relative z-20 w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Columna derecha - Imagen (solo en desktop) */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#F2F1E7] min-h-screen relative overflow-hidden">
          {/* Elementos decorativos para el lado derecho */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            {/* Burbujas estáticas adicionales en beige */}
            <div className="absolute top-20 left-20 w-24 h-24 rounded-full shadow-lg" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.5), rgba(34, 211, 238, 0.15))' }}></div>
            <div className="absolute top-2/3 right-20 w-20 h-20 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.18))' }}></div>
            <div className="absolute bottom-32 left-1/3 w-16 h-16 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.5), rgba(34, 211, 238, 0.12))' }}></div>
            <div className="absolute top-1/2 right-1/4 w-14 h-14 rounded-full shadow-lg" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.6), rgba(34, 211, 238, 0.2))' }}></div>
            <div className="absolute bottom-20 right-1/3 w-12 h-12 rounded-full shadow-md" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.15))' }}></div>
          </div>
          <div className="relative z-20 flex items-center justify-center w-full h-full">
            <img
              src="/login7.png"
              alt="ArmoniClick"
              className="w-auto object-contain"
              style={{ maxHeight: '780px' }}
            />
          </div>
        </div>
      </section>
    </main>
  );
};