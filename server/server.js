const app = require('./app');
const initializeDatabase = require('./config/init-db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔄 Initializing ShopNest MySQL Database...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 ShopNest Server running on http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
