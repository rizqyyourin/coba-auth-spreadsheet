// proxy.js (Node.js CommonJS)
const express = require('express');
const app = express();

// terima body sebagai text → simple request (minim preflight)
app.use(express.text({ type: '*/*' }));

// GANTI ke URL /exec Apps Script kamu
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzfW8-AQIUPNlqVPHKe9bR8qop2ftAJ4n0La-ebK09sAGuW-CVPGsMBtgbcTCW7BlSR/exec';

app.post('/api', async (req, res) => {
  try {
    const upstream = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: req.body || ''
    });
    const text = await upstream.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.status(upstream.status).send(text);
  } catch (e) {
    res.set('Access-Control-Allow-Origin', '*');
    res.status(502).json({ error: 'proxy error', detail: String(e) });
  }
});

app.options('/api', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.sendStatus(200);
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dev proxy → http://localhost:${PORT}/api  (health: /health)`));
