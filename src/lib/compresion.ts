// Función para comprimir imágenes y reducir tamaño
export async function comprimirImagen(base64: string, calidad: number = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(base64); // Si no se puede comprimir, devolver original
        return;
      }

      // Reducir tamaño: máximo 800px de ancho
      let width = img.width;
      let height = img.height;

      if (width > 800) {
        height = (height * 800) / width;
        width = 800;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen comprimida
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a JPEG con calidad reducida
      const comprimida = canvas.toDataURL('image/jpeg', calidad);
      resolve(comprimida);
    };

    img.onerror = () => {
      resolve(base64); // Si hay error, devolver original
    };
  });
}

// Comprimir múltiples imágenes en paralelo
export async function comprimirImagenes(fotos: string[]): Promise<string[]> {
  const promesas = fotos.map((foto) => comprimirImagen(foto));
  return Promise.all(promesas);
}
