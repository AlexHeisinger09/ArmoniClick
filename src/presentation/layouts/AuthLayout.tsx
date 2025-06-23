import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <main className="relative p-4 sm:p-8 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo base blanco */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Burbujas de fondo animadas con nueva paleta */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Burbujas grandes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 180 + 100}px`,
              height: `${Math.random() * 180 + 100}px`,
              backgroundColor: [
                '#e0f7fa', // cyan-lightest
                '#67e8f9', // cyan-lighter
                '#06b6d4', // cyan-light
              ][Math.floor(Math.random() * 3)],
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 5 + 4}s`
            }}
          />
        ))}
        
        {/* Burbujas medianas */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute rounded-full opacity-50 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 90 + 50}px`,
              height: `${Math.random() * 90 + 50}px`,
              backgroundColor: [
                '#e0f7fa', // cyan-lightest
                '#67e8f9', // cyan-lighter
                '#06b6d4', // cyan-light
                '#dcfdf4', // success light
                '#fffbeb'  // warning light
              ][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`
            }}
          />
        ))}
        
        {/* Burbujas pequeñas */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full opacity-60 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 15}px`,
              height: `${Math.random() * 40 + 15}px`,
              backgroundColor: [
                '#e0f7fa', // cyan-lightest
                '#67e8f9', // cyan-lighter
                '#06b6d4', // cyan-light
                '#dcfdf4', // success light
                '#fffbeb', // warning light
                '#f8fafc'  // gris-claro
              ][Math.floor(Math.random() * 6)],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
        
        {/* Burbujas muy pequeñas para más densidad */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`tiny-${i}`}
            className="absolute rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              backgroundColor: [
                '#e0f7fa', // cyan-lightest
                '#67e8f9', // cyan-lighter
                '#06b6d4', // cyan-light
                '#dcfdf4', // success light
                '#fffbeb', // warning light
                '#f8fafc', // gris-claro
                '#64748b'  // gris-medio
              ][Math.floor(Math.random() * 7)],
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
      </div>

      {/* Contenedor principal - FONDO CYAN-LIGHTEST */}
      <section className="relative z-10 w-full max-w-lg mx-auto bg-cyan-100 rounded-lg shadow-xl border border-cyan-200">
        <div className="flex items-center justify-center w-full p-6 sm:p-8">
          <Outlet />
        </div>
      </section>
    </main>
  );
};