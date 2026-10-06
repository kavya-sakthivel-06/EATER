import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <h1 className="text-3xl font-bold text-leaf">Eater</h1>
        <p className="text-sm text-ink/60">Track what you spend and eat at campus canteens.</p>
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full">Log in</button>
      </form>
    </div>
  );
}
