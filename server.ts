import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_API_KEY = process.env.TMDB_API_KEY || "74a6132d309245d487e3b93904335056";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for TMDB requests with error handling
  app.get("/api/tmdb/*", async (req, res) => {
    try {
      const endpoint = req.params[0];
      const queryParams = new URLSearchParams(req.query as Record<string, string>);
      queryParams.set("api_key", TMDB_API_KEY);

      const targetUrl = `${TMDB_BASE_URL}/${endpoint}?${queryParams.toString()}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `TMDB API error: ${response.statusText}` });
      }

      const data = await response.json();
      // Set cache headers to optimize TMDB API calls
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
      res.json(data);
    } catch (err: any) {
      console.error("TMDB proxy error:", err);
      res.status(500).json({ error: err.message || "Internal server error proxying TMDB request" });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "CineStream Server" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 CineStream server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
