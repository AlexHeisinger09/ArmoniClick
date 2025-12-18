/**
 * Helper para generar URLs de Cloudinary con transformaciones
 */

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'jpg' | 'png' | 'webp';
};

/**
 * Genera una URL de Cloudinary con transformaciones aplicadas
 * @param imageUrl - URL original de Cloudinary
 * @param options - Opciones de transformación
 * @returns URL transformada
 *
 * @example
 * // Imagen con thumbnail 400x300 con detección automática del punto focal
 * getCloudinaryUrl(imageUrl, { width: 400, height: 300, crop: 'fill', gravity: 'auto' })
 *
 * // Imagen optimizada con calidad automática
 * getCloudinaryUrl(imageUrl, { quality: 'auto:good', format: 'webp' })
 */
export const getCloudinaryUrl = (
  imageUrl: string,
  options: CloudinaryTransformOptions = {}
): string => {
  // Si no es una URL de Cloudinary, retornar la URL original
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  try {
    // Valores por defecto
    const {
      width,
      height,
      crop = 'fill',
      gravity = 'auto',
      quality = 'auto:good',
      format
    } = options;

    // Construir transformación
    const transformParts: string[] = [];

    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (crop) transformParts.push(`c_${crop}`);
    if (gravity) transformParts.push(`g_${gravity}`);
    if (quality) transformParts.push(`q_${quality}`);
    if (format) transformParts.push(`f_${format}`);

    const transformation = transformParts.join(',');

    // Insertar transformación en la URL
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      console.warn('No se encontró "/upload/" en la URL de Cloudinary');
      return imageUrl;
    }

    const beforeUpload = imageUrl.substring(0, uploadIndex + 8); // +8 para incluir '/upload/'
    const afterUpload = imageUrl.substring(uploadIndex + 8);

    return `${beforeUpload}${transformation}/${afterUpload}`;
  } catch (error) {
    console.error('Error al transformar URL de Cloudinary:', error);
    return imageUrl;
  }
};

/**
 * Genera URL de thumbnail para miniatura con detección inteligente
 * @param imageUrl - URL original de Cloudinary
 * @returns URL de thumbnail 400x300 con gravity auto
 */
export const getCloudinaryThumbnail = (imageUrl: string): string => {
  return getCloudinaryUrl(imageUrl, {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:eco',
    format: 'jpg'
  });
};

/**
 * Genera URL de imagen de alta calidad para vista completa
 * @param imageUrl - URL original de Cloudinary
 * @returns URL de imagen 800x600 con gravity auto
 */
export const getCloudinaryFullSize = (imageUrl: string): string => {
  return getCloudinaryUrl(imageUrl, {
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    format: 'jpg'
  });
};
