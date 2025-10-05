import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Dumb in-memory "scores" store
let bestTimes = []; // {name, ms, at}

// Save a completion
app.post("/api/score", (req, res) => {
  const { name = "anon", ms = 0 } = req.body || {};
  if (typeof ms !== "number" || ms <= 0) return res.status(400).json({ error: "bad ms" });
  bestTimes.push({ name: String(name).slice(0, 32), ms, at: Date.now() });
  bestTimes = bestTimes.sort((a, b) => a.ms - b.ms).slice(0, 20);
  res.json({ ok: true, bestTimes });
});

// Read top scores
app.get("/api/score", (_req, res) => res.json({ bestTimes }));

// (Optional) serve built frontend in production
if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
