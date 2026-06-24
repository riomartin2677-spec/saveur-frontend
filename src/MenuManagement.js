import { useState, useEffect } from "react";

const BASE = "http://localhost:8080/api";
const getToken = () => localStorage.getItem("token");

const CATEGORIES = ["Burgers", "Pizza", "Pasta", "Salads", "Sides", "Desserts", "Drinks", "Mains"];

const emptyForm = { name: "", description: "", emoji: "", category: "Burgers", price: "", prepTime: "", available: true };

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadItems = async () => {
    const res = await fetch(`${BASE}/menu/all`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { loadItems(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price) return;
    const url = editId ? `${BASE}/menu/${editId}` : `${BASE}/menu`;
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), prepTime: parseInt(form.prepTime) })
    });
    showToast(editId ? "Item updated!" : "Item added!");
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    loadItems();
  };

  const handleEdit = (item) => {
    setForm({ ...item, price: item.price.toString(), prepTime: item.prepTime.toString() });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await fetch(`${BASE}/menu/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    showToast("Item deleted!", "error");
    loadItems();
  };

  const handleToggle = async (id) => {
    await fetch(`${BASE}/menu/${id}/toggle`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    loadItems();
  };

  return (
    <div style={{ padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toast.type === "success" ? "#1C1917" : "#EF4444", color: "white", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#1C1917" }}>🍽️ Menu Management</div>
          <div style={{ fontSize: 12, color: "#A8A29E" }}>{items.length} items total</div>
        </div>
        <button onClick={() => { setShowForm(o => !o); setForm(emptyForm); setEditId(null); }}
          style={{ background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Add Dish
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>{editId ? "Edit Dish" : "Add New Dish"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Dish name *" style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              placeholder="Emoji (e.g. 🍕)" style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description" style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", gridColumn: "1 / -1" }} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "white" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Price (e.g. 12.99) *" type="number" style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            <input value={form.prepTime} onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))}
              placeholder="Prep time (minutes)" type="number" style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSubmit}
                style={{ flex: 1, background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {editId ? "Update Dish" : "Add Dish"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                style={{ background: "#F5F5F4", color: "#78716C", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Table */}
      <div style={{ background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E4" }}>
              {["Item", "Category", "Price", "Prep Time", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#78716C", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #F5F5F4" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1C1917" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#A8A29E" }}>{item.description}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: "#F5F5F4", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, color: "#78716C" }}>{item.category}</span>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#F97316" }}>${item.price}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#78716C" }}>~{item.prepTime}m</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => handleToggle(item.id)}
                    style={{ background: item.available ? "#ECFDF5" : "#FEF2F2", color: item.available ? "#16A34A" : "#DC2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {item.available ? "✅ Available" : "❌ Unavailable"}
                  </button>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(item)}
                      style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}