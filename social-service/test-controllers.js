// Test simple para verificar que los controladores se pueden importar
console.log('Testing controllers import...');

try {
  const CommunityController = require('./src/presentation/controllers/CommunityController');
  const controller = new CommunityController();
  console.log('✅ CommunityController - OK');
  console.log('Methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(controller)));
} catch (error) {
  console.error('❌ CommunityController error:', error.message);
}

try {
  const PreferencesController = require('./src/presentation/controllers/PreferencesController');
  const controller = new PreferencesController();
  console.log('✅ PreferencesController - OK');
} catch (error) {
  console.error('❌ PreferencesController error:', error.message);
}

try {
  const CompleteProfileController = require('./src/presentation/controllers/CompleteProfileController');
  const controller = new CompleteProfileController();
  console.log('✅ CompleteProfileController - OK');
} catch (error) {
  console.error('❌ CompleteProfileController error:', error.message);
}

try {
  const FriendshipController = require('./src/presentation/controllers/FriendshipController');
  const controller = new FriendshipController();
  console.log('✅ FriendshipController - OK');
} catch (error) {
  console.error('❌ FriendshipController error:', error.message);
}

console.log('Controller tests completed');