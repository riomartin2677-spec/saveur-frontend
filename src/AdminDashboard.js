import { useState, useEffect } from "react";


const BASE = "http://localhost:8080/api";
const getToken = () => localStorage.getItem("token");

const ROLES = ["CUSTOMER", "KITCHEN", "ADMIN"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadOrders();
  }, []);

  const loadStats = async () => {
    const res = await fetch(`${BASE}/admin/stats`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setStats(data);
  };

  const loadUsers = async () => {
    const res = await fetch(`${BASE}/admin/users`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setUsers(data);
  };

  const loadOrders = async () => {
    const res = await fetch(`${BASE}/orders`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  const changeRole = async (id, role) => {
    await fetch(`${BASE}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ role })
    });
    showToast("Role updated!");
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`${BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    showToast("User deleted!", "error");
    loadUsers();
  };

  const ROLE_COLORS = {
    CUSTOMER: { bg: "#EFF6FF", text: "#2563EB" },
    KITCHEN:  { bg: "#FFF7ED", text: "#F97316" },
    ADMIN:    { bg: "#FDF4FF", text: "#9333EA" },
  };

  const STAGE_COLORS = {
    PLACED:    "#6366F1",
    CONFIRMED: "#F59E0B",
    PREPARING: "#EF4444",
    READY:     "#10B981",
    DELIVERED: "#64748B",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toast.type === "success" ? "#1C1917" : "#EF4444", color: "white", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#1C1917" }}>👑 Admin Dashboard</div>
        <div style={{ fontSize: 12, color: "#A8A29E" }}>Manage your restaurant</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["overview", "users", "orders"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: tab === t ? "#1C1917" : "white", color: tab === t ? "white" : "#78716C", border: "1px solid #E7E5E4", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {t === "overview" ? "📊 Overview" : t === "users" ? "👥 Users" : "📋 Orders"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && stats && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Revenue", val: `₹${stats.totalRevenue?.toFixed(2)}`, color: "#F97316", bg: "#FFF7ED" },
              { label: "Total Orders", val: stats.totalOrders, color: "#6366F1", bg: "#EEF2FF" },
              { label: "Active Orders", val: stats.activeOrders, color: "#EF4444", bg: "#FEF2F2" },
              { label: "Delivered", val: stats.deliveredOrders, color: "#10B981", bg: "#ECFDF5" },
              { label: "Total Users", val: stats.totalUsers, color: "#8B5CF6", bg: "#F5F3FF" },
              { label: "Customers", val: stats.totalCustomers, color: "#F59E0B", bg: "#FFFBEB" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 12, padding: "16px" }}>
                <div style={{ fontSize: 11, color: "#78716C", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div style={{ background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Recent Orders</div>
            {orders.slice(0, 5).map(order => (
              <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F5F5F4" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Order #{order.id}</div>
                  <div style={{ fontSize: 11, color: "#A8A29E" }}>{order.customerName} · Table {order.tableNo}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STAGE_COLORS[order.stage], background: `${STAGE_COLORS[order.stage]}15`, padding: "3px 10px", borderRadius: 10 }}>
                    {order.stage}
                  </span>
                  <span style={{ fontWeight: 700, color: "#F97316" }}>₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div style={{ background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E4" }}>
                {["Name", "Email", "Role", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#78716C", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid #F5F5F4" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>{user.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#78716C" }}>{user.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                      style={{ background: ROLE_COLORS[user.role]?.bg, color: ROLE_COLORS[user.role]?.text, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => deleteUser(user.id)}
                      style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div style={{ background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E4" }}>
                {["Order", "Customer", "Items", "Total", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#78716C", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: "1px solid #F5F5F4" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13 }}>#{order.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: 11, color: "#A8A29E" }}>Table {order.tableNo}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#78716C" }}>{order.items?.length} items</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#F97316" }}>₹{order.total?.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: STAGE_COLORS[order.stage], background: `${STAGE_COLORS[order.stage]}15`, padding: "3px 10px", borderRadius: 10 }}>
                      {order.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}