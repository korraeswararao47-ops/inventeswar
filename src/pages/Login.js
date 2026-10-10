import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";

export default function Login() {
  const { login, signup } = useInventory();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form.fullName, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Smart Inventory</h1>
        <p className="muted">
          {mode === "login" ? "Log in to manage your stock." : "Create an account. The first account becomes the administrator."}
        </p>
        {mode === "signup" && <label>Full name<input value={form.fullName} onChange={set("fullName")} autoFocus /></label>}
        <label>Email<input type="email" value={form.email} onChange={set("email")} /></label>
        <label>Password<input type="password" value={form.password} onChange={set("password")} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{mode === "login" ? "Log in" : "Create account"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
