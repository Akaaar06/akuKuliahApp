import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Dataset for Discord Bot API (Strictly Tugas and Materi ONLY per instructions)
const discordTasks: any[] = [];
const discordMaterials: any[] = [];

// 8. DISCORD BOT API ENDPOINTS (HANYA Tugas & Materi)
app.get('/api/tugas', (_req, res) => {
  res.json({
    status: 'success',
    data: discordTasks,
  });
});

app.get('/api/materi', (_req, res) => {
  res.json({
    status: 'success',
    data: discordMaterials,
  });
});

app.get('/api/materi/:id', (req, res) => {
  const item = discordMaterials.find((m) => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({
      status: 'error',
      message: 'Materi tidak ditemukan',
    });
  }
  res.json({
    status: 'success',
    data: item,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        if (e instanceof Error) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`akuKuliah server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
