import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { checkSpeed } from "./src/services/speedService.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for speed check
  app.post("/api/check-speed", async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const apiKey = process.env.PAGESPEED_API_KEY || 'AIzaSyCgrX7A2svBmI9z4UjrHb6hdBb__gUbqu8';
    const result = await checkSpeed(url, apiKey);
    res.json(result);
  });


  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Speed Checker API is active" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
