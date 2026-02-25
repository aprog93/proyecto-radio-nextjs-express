/**
 * Server entry point
 */

import { getDatabase, closeDatabase } from './config/database.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;
const AZURACAST_URL = process.env.AZURACAST_BASE_URL || 'http://localhost:8000';

async function startServer() {
  try {
    // Inicializar base de datos
    const db = await getDatabase();

    // Crear aplicación Express
    const app = createApp(db);

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║        🎙️  Radio Cesar Backend Server Started             ║
╚════════════════════════════════════════════════════════════╝

📡 API Server:     http://localhost:${PORT}
🌍 CORS Origin:    ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
📚 AzuraCast:      ${AZURACAST_URL}/api
📊 Database:       SQLite (data/radio_cesar.db)
🔧 Environment:    ${process.env.NODE_ENV || 'development'}

✅ Ready to accept connections
      `);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('✓ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
