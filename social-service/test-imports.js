console.log('Probando importación de CommunityController...');

try {
  const CommunityController = require('./src/presentation/controllers/CommunityController');
  console.log('✅ CommunityController importado correctamente');
  
  const controller = new CommunityController();
  console.log('✅ CommunityController instanciado correctamente');
  
  console.log('Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(controller)));
  
  if (typeof controller.createCommunity === 'function') {
    console.log('✅ Método createCommunity existe y es una función');
  } else {
    console.log('❌ Método createCommunity no existe o no es una función');
  }
} catch (error) {
  console.log('❌ Error importando CommunityController:', error.message);
}

console.log('\nProbando middlewares...');

try {
  const { authMiddleware } = require('./src/infrastructure/middleware/authMiddleware');
  console.log('✅ authMiddleware importado correctamente');
  
  if (typeof authMiddleware === 'function') {
    console.log('✅ authMiddleware es una función');
  } else {
    console.log('❌ authMiddleware no es una función');
  }
} catch (error) {
  console.log('❌ Error importando authMiddleware:', error.message);
}

try {
  const validationMiddleware = require('./src/infrastructure/middleware/validationMiddleware');
  console.log('✅ validationMiddleware importado correctamente');
  
  if (validationMiddleware.validateCommunityCreation) {
    console.log('✅ validateCommunityCreation existe');
  } else {
    console.log('❌ validateCommunityCreation no existe');
  }
} catch (error) {
  console.log('❌ Error importando validationMiddleware:', error.message);
}

try {
  const upload = require('./src/infrastructure/middleware/uploadMiddleware');
  console.log('✅ upload middleware importado correctamente');
  
  if (typeof upload.single === 'function') {
    console.log('✅ upload.single es una función');
  } else {
    console.log('❌ upload.single no es una función');
  }
} catch (error) {
  console.log('❌ Error importando uploadMiddleware:', error.message);
}