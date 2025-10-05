// src/App.jsx
import React, { useState, useEffect } from "react";
import LoginFlappy from "./components/LoginFlappy.jsx";
import Signup from "./components/Signup.jsx";
import "./styles.css";

export default function App() {
  const MIN = 7;

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [allow, setAllow] = useState(0);   // best score from Flappy
  const [msg, setMsg] = useState("");

  // trim password if allowance shrinks
  useEffect(() => {
    setPw((p) => (p.length > allow ? p.slice(0, allow) : p));
  }, [allow]);

  function onType(v) {
    if (v.length <= allow) setPw(v);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!email.trim()) return setMsg("Enter your email first.");
    if (allow < MIN)   return setMsg(`Get at least ${MIN} in Flappy to unlock enough characters.`);
    if (pw.length < MIN) return setMsg(`Password must be at least ${MIN} characters.`);
    setMsg("Logged in! (fake)");
  }

  const showGate = email.trim() !== "";

  return (
    <div className="page">
      <div className="card">
        <header className="topbar">
          <h1>HackUTA Worst Auth</h1>
        </header>

        <div className="tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => { setMode("login"); setMsg(""); }}
          >
            Log In
          </button>
          <button
            className={mode === "signup" ? "tab active" : "tab"}
            onClick={() => { setMode("signup"); setMsg(""); }}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="form">
            <label>Username / Email</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // reset when username changes
                setPw("");
                setAllow(0);
                setMsg("");
              }}
              placeholder="you@example.com"
            />

            {showGate && (
              <>
                <label>Password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => onType(e.target.value)}
                  placeholder={`unlocked via Flappy (min ${MIN})`}
                />
                <div className="tiny">
                  Allowed characters (best score): {allow}. You need at least {MIN}.
                </div>

                <div className="gate">
                  <div className="gate-head">
                    <strong>Flappy Trash:</strong> pass cans to unlock letters
                  </div>
                  {/* key=email ensures a fresh game when username changes */}
                  <LoginFlappy
                    key={email || "nouser"}
                    min={MIN}
                    onAllowanceChange={setAllow}
                  />
                </div>

                {/* ✅ Submit button in the bottom actions row */}
                <div className="actions">
                  <button type="submit" disabled={pw.length < MIN}>
                    Submit
                  </button>
                </div>

                {msg && <div className="msg">{msg}</div>}
              </>
            )}

            {!showGate && (
              <div className="tiny">Enter your email to unlock the password & game.</div>
            )}
          </form>
        ) : (
          <Signup />
        )}
      </div>
    </div>
  );
}
