const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads/publications');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Directorio de uploads creado:', uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Nombre único: timestamp + random + extensión
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `pub-${uniqueSuffix}${ext}`;
        console.log('📝 Generando nombre de archivo:', filename);
        cb(null, filename);
    }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    console.log('🔍 Validando archivo:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        encoding: file.encoding
    });
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        console.log('✅ Archivo válido:', file.fieldname);
        return cb(null, true);
    } else {
        console.log('❌ Tipo de archivo no permitido:', file.mimetype);
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

console.log('✅ Multer configurado correctamente');

module.exports = upload;