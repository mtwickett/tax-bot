import http from 'http';
import app from './app';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 3000;

// Attach HTTP + WS servers
const server = http.createServer(app);
new WebSocketServer({ server, path: '/media' /* …etc… */ });

server.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});
