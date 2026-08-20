const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// Em produção (Railway), usa volume persistente em /data; localmente usa a pasta do projeto
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'server-data.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {}
  return { pedidos: [], catalogo: [], params: null };
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/data', (req, res) => {
  writeData(req.body);
  res.json({ ok: true });
});

// SPA fallback
app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 4173;
app.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIP = 'localhost';
  for (const iface of Object.values(nets)) {
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) { localIP = net.address; break; }
    }
  }
  console.log(`\nSimulador rodando:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Rede:    http://${localIP}:${PORT}  <- compartilhe este endereco\n`);
});
