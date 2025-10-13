// Manual build script for testing the new architecture

const { init } = require('../../dist/index');

(async () => {
  try {
    await init();
    console.log('\n✅ Build V2 completed successfully!');
  } catch (error) {
    console.error('\n❌ Build V2 failed:', error);
    process.exit(1);
  }
})();
