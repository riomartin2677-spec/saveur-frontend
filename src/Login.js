import { useState } from "react";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const url = isRegister
        ? "http://localhost:8080/api/auth/register"
        : "http://localhost:8080/api/auth/login";

      const body = isRegister
        ? { name: form.name, email: form.email, password: form.password, role: form.role }
        : { email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong!");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: "white", border: "1px solid #F5F5F4", borderRadius: 16, padding: 32, width: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🍽️</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#1C1917" }}>Saveur</div>
          <div style={{ fontSize: 13, color: "#A8A29E", marginTop: 4 }}>
            {isRegister ? "Create your account" : "Welcome back!"}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isRegister && (
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full Name"
              style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", color: "#1C1917" }}
            />
          )}

          <input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            type="email"
            style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", color: "#1C1917" }}
          />

          <input
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Password"
            type="password"
            style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", color: "#1C1917" }}
          />

          {isRegister && (
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "10px 12px", fontSize: 13, background: "white", color: "#1C1917" }}
            >
              <option value="CUSTOMER">🛒 Customer</option>
              <option value="KITCHEN">👨‍🍳 Kitchen Staff</option>
              <option value="ADMIN">👑 Admin</option>
            </select>
          )}

          {error && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>
        </div>

        {/* Toggle */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#78716C" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setIsRegister(r => !r)}
            style={{ color: "#F97316", fontWeight: 600, cursor: "pointer", marginLeft: 6 }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </div>
      </div>
    </div>
  );
}