const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Servicio de Cloudinary para el Microservicio Social
 * Implementación real que reemplaza el mock del contenedor
 */
class CloudinaryServiceImpl {
  
  /**
   * Subir archivo a Cloudinary
   */
  async upload(file, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'social-service',
        resource_type: options.resourceType || 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options
      };

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        resourceType: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        createdAt: result.created_at
      };

    } catch (error) {
      throw new Error(`Error al subir archivo a Cloudinary: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo de Cloudinary
   */
  async delete(publicId, options = {}) {
    try {
      const deleteOptions = {
        resource_type: options.resourceType || 'image',
        ...options
      };

      const result = await cloudinary.uploader.destroy(publicId, deleteOptions);
      
      return {
        result: result.result,
        publicId
      };

    } catch (error) {
      throw new Error(`Error al eliminar archivo de Cloudinary: ${error.message}`);
    }
  }

  /**
   * Obtener información de un archivo
   */
  async getInfo(publicId, options = {}) {
    try {
      const resourceOptions = {
        resource_type: options.resourceType || 'image',
        ...options
      };

      const result = await cloudinary.api.resource(publicId, resourceOptions);
      
      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at
      };

    } catch (error) {
      throw new Error(`Error al obtener información de Cloudinary: ${error.message}`);
    }
  }

  /**
   * Generar URL optimizada
   */
  generateOptimizedUrl(publicId, options = {}) {
    try {
      return cloudinary.url(publicId, {
        quality: options.quality || 'auto',
        fetch_format: options.format || 'auto',
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        secure: true,
        ...options
      });
    } catch (error) {
      throw new Error(`Error al generar URL optimizada: ${error.message}`);
    }
  }

  /**
   * Subir múltiples archivos
   */
  async uploadMultiple(files, options = {}) {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileOptions = {
          ...options,
          folder: `${options.folder || 'social-service'}/${Date.now()}_${index}`
        };
        return this.upload(file, fileOptions);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Error al subir múltiples archivos: ${error.message}`);
    }
  }

  /**
   * Verificar que Cloudinary está configurado correctamente
   */
  async testConnection() {
    try {
      await cloudinary.api.ping();
      return {
        success: true,
        message: 'Conexión con Cloudinary exitosa'
      };
    } catch (error) {
      throw new Error(`Error de conexión con Cloudinary: ${error.message}`);
    }
  }
}

module.exports = CloudinaryServiceImpl;