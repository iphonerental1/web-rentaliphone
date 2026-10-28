const app = require('./src/app');
const { PORT } = require('./src/config/env');

const server = app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 Endpoint API: http://localhost:${PORT}/api/v1`);
  console.log(`💡 Health Check: http://localhost:${PORT}/api/v1/health`);
});

module.exports = server;
