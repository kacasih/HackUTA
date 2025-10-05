import React, { useMemo, useState } from "react";
import { encryptToy } from "../utils/Crypto.js";
import OutrageousDOB from "./OutrageousDOB.jsx";

const MIN = 7;

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false); // optional “show challenge”
  const [dob, setDob] = useState({ year: 2025, month: 1, day: 1 }); // start at 2025

  // Gating
  const canPassword = email.trim() !== "";
  const canKey = canPassword && password.length >= MIN;
  const canConfirm = canKey && key !== "";

  const ciphertext = useMemo(
    () => (canConfirm ? encryptToy(password, key) : ""),
    [password, key, canConfirm]
  );
  const match = canConfirm && confirm === ciphertext;

  function submit(e) {
    e.preventDefault();
    if (!match) return;
    alert(`🎉 Signed up (fake)
Email: ${email}
DOB: ${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}
Key: ${key}
Password: ${password}
Confirm (encrypted): ${confirm}`);
  }

  function resetFromEmail(v) {
    setEmail(v);
    setPassword("");
    setKey("");
    setConfirm("");
  }

  return (
    <form onSubmit={submit} className="form">
      {/* Email */}
      <label>Username / Email</label>
      <input
        value={email}
        onChange={(e) => resetFromEmail(e.target.value)}
        placeholder="you@example.com"
      />

      {/* Password (min 7) */}
      {canPassword && (
        <div className="ridiculous">
          <h3>🔓 Password</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setKey("");
              setConfirm("");
            }}
            placeholder={`minimum ${MIN} characters`}
          />
          <div className="tiny">
            {password.length >= MIN
              ? "Nice. You may now choose your totally unnecessary encryption key."
              : `Type at least ${MIN} characters to proceed.`}
          </div>
        </div>
      )}

      {/* Encryption key */}
      {canKey && (
        <div className="ridiculous">
          <h3>🔑 Encryption Key</h3>
          <input
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setConfirm("");
            }}
            placeholder="enter your secret key (any string)"
          />
          <div className="tiny">
            Your confirm password must equal <em>encrypt(password, key)</em> (toy cipher).
          </div>
        </div>
      )}

      {/* Confirm = encrypted(password, key) */}
      {canConfirm && (
        <div className="ridiculous">
          <h3>🔒 Confirm Password (Encrypted)</h3>
          <div className="tiny" style={{ marginBottom: 6 }}>
            Type the encrypted output yourself. If you're lost,{" "}
            <button
              type="button"
              className="hold"
              onClick={() => setReveal((r) => !r)}
              style={{ padding: "4px 8px", marginLeft: 6 }}
            >
              {reveal ? "Hide challenge" : "Reveal challenge"}
            </button>
          </div>
          {reveal && (
            <div className="tiny" style={{ wordBreak: "break-all", marginBottom: 6 }}>
              Challenge ciphertext: <code>{ciphertext}</code>
            </div>
          )}
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="type encrypt(password, key) here"
          />
          <div className="tiny" style={{ color: match ? "#22c55e" : "#f59e0b" }}>
            {match ? "✅ Encrypted confirm matches!" : "Waiting for a perfect encrypted match…"}
          </div>
        </div>
      )}

      {/* DOB — orbital selector starting at 2025; full orbit = +/−1 year */}
      <div className="ridiculous">
        <h3>🌍 Orbital Birthdate Picker</h3>
        <OutrageousDOB value={dob} onChange={setDob} startYear={2025} />
        <div className="tiny">
          Drag the planet around the ellipse to pick day-of-year. Each full revolution changes the
          year. Current: {dob.year}-{String(dob.month).padStart(2, "0")}-
          {String(dob.day).padStart(2, "0")}
        </div>
      </div>

        <div className="actions">
            <button disabled={!match}>Create Account</button>
        </div>
    </form>
  );
}
