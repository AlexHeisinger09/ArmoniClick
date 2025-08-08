// src/utils/signatureProcessor.ts - SOLUCIÓN 100% GRATUITA
export class SignatureProcessor {
  /**
   * Procesa una imagen de firma para remover fondo y mejorar calidad
   * @param file - Archivo de imagen original
   * @returns Promise<File> - Archivo procesado con fondo transparente
   */
  static async processSignature(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      img.onload = () => {
        // Configurar canvas con dimensiones optimizadas
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibujar imagen original
        ctx.drawImage(img, 0, 0);

        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Procesar cada píxel (RGBA)
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const alpha = data[i + 3];
          
          // Calcular brillo del píxel (0-255)
          const brightness = (red + green + blue) / 3;
          
          // PASO 1: Remover fondos claros
          if (brightness > 240) {
            // Blanco casi puro -> transparente
            data[i + 3] = 0;
          } else if (brightness > 200) {
            // Gris muy claro -> semi-transparente
            data[i + 3] = Math.floor(alpha * 0.2);
          } else if (brightness > 150) {
            // Gris medio -> más transparente
            data[i + 3] = Math.floor(alpha * 0.4);
          } else if (brightness > 100) {
            // Gris oscuro -> menos transparente
            data[i + 3] = Math.floor(alpha * 0.7);
          } else {
            // PASO 2: Mejorar píxeles oscuros (la firma)
            // Hacer más negro y contrastado
            const darknessFactor = 0.4; // Hace más oscuro
            data[i] = Math.floor(red * darknessFactor);       // Rojo más oscuro
            data[i + 1] = Math.floor(green * darknessFactor); // Verde más oscuro
            data[i + 2] = Math.floor(blue * darknessFactor);  // Azul más oscuro
            data[i + 3] = 255; // Completamente opaco
          }
        }

        // Aplicar los cambios al canvas
        ctx.putImageData(imageData, 0, 0);

        // Convertir canvas a blob PNG (mantiene transparencia)
        canvas.toBlob((blob) => {
          if (blob) {
            // Crear nuevo archivo con nombre descriptivo
            const fileName = `firma_procesada_${Date.now()}.png`;
            const processedFile = new File([blob], fileName, { 
              type: 'image/png' 
            });
            resolve(processedFile);
          } else {
            reject(new Error('Error al generar la imagen procesada'));
          }
        }, 'image/png', 1.0); // Calidad máxima
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      // Cargar la imagen desde el archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Versión alternativa con más control sobre la transparencia
   * @param file - Archivo original
   * @param sensitivity - Sensibilidad para detectar fondo (1-10, default: 6)
   * @returns Promise<File> - Archivo procesado
   */
  static async processSignatureAdvanced(file: File, sensitivity: number = 6): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Ajustar umbrales según sensibilidad
        const whiteThreshold = 255 - (sensitivity * 5);    // Umbral para blanco
        const grayThreshold = 200 - (sensitivity * 10);    // Umbral para gris
        const darkThreshold = 120 - (sensitivity * 5);     // Umbral para oscuro

        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const brightness = (red + green + blue) / 3;

          if (brightness > whiteThreshold) {
            // Fondo claro -> transparente
            data[i + 3] = 0;
          } else if (brightness > grayThreshold) {
            // Zona intermedia -> gradual
            const opacity = (whiteThreshold - brightness) / (whiteThreshold - grayThreshold);
            data[i + 3] = Math.floor(opacity * 255);
          } else {
            // Zona oscura (firma) -> mejorar contraste
            const contrast = brightness < darkThreshold ? 0.3 : 0.5;
            data[i] = Math.floor(red * contrast);
            data[i + 1] = Math.floor(green * contrast);
            data[i + 2] = Math.floor(blue * contrast);
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `firma_avanzada_${Date.now()}.png`;
            const processedFile = new File([blob], fileName, { 
              type: 'image/png' 
            });
            resolve(processedFile);
          } else {
            reject(new Error('Error al generar la imagen procesada'));
          }
        }, 'image/png', 1.0);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}