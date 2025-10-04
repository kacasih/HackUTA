import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();
app.use(cors());               // dev: allow all origins
app.use(express.json());

const PORT = process.env.PORT || 3001;

// super-simple in-memory "DB"
const users = new Map();
// Seed demo user: test@example.com / test1234
{
  const email = "test@example.com";
  const hash = bcrypt.hashSync("test1234", 10);
  users.set(email, { email, hash, createdAt: new Date().toISOString() });
}

app.get("/", (_req, res) => res.json({ ok: true, service: "gravity-courier-backend" }));

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  if (users.has(email)) return res.status(409).json({ message: "user already exists" });
  const hash = await bcrypt.hash(password, 10);
  users.set(email, { email, hash, createdAt: new Date().toISOString() });
  res.json({ message: "signup ok" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  const u = users.get(email);
  if (!u) return res.status(401).json({ message: "invalid credentials" });
  const ok = await bcrypt.compare(password, u.hash);
  if (!ok) return res.status(401).json({ message: "invalid credentials" });
  // You would normally issue a JWT or session cookie here.
  res.json({ message: "login ok", user: { email: u.email, createdAt: u.createdAt } });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
