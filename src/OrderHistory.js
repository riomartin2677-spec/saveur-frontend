import { useState, useEffect } from "react";

const BASE = "http://localhost:8080/api";
const getToken = () => localStorage.getItem("token");

const STAGE_META = {
  PLACED:    { color: "#6366F1", bg: "#EEF2FF", icon: "📋", label: "Placed" },
  CONFIRMED: { color: "#F59E0B", bg: "#FFFBEB", icon: "✅", label: "Confirmed" },
  PREPARING: { color: "#EF4444", bg: "#FEF2F2", icon: "👨‍🍳", label: "Preparing" },
  READY:     { color: "#10B981", bg: "#ECFDF5", icon: "🔔", label: "Ready" },
  DELIVERED: { color: "#64748B", bg: "#F8FAFC", icon: "🎉", label: "Delivered" },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/orders/my`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoading(false);
  };

  const filteredOrders = filter === "ALL" ? orders :
    filter === "ACTIVE" ? orders.filter(o => o.stage !== "DELIVERED") :
    orders.filter(o => o.stage === "DELIVERED");

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Orders", val: orders.length, color: "#F97316", bg: "#FFF7ED" },
          { label: "Delivered", val: orders.filter(o => o.stage === "DELIVERED").length, color: "#10B981", bg: "#ECFDF5" },
          { label: "Total Spent", val: `₹${totalSpent.toFixed(2)}`, color: "#6366F1", bg: "#EEF2FF" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${s.color}20` }}>
            <div style={{ fontSize: 11, color: "#78716C", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "ACTIVE", "DELIVERED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? "#F97316" : "white", color: filter === f ? "white" : "#78716C", border: "1px solid #E7E5E4", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {f === "ALL" ? "All Orders" : f === "ACTIVE" ? "Active" : "Delivered"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#A8A29E" }}>Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#A8A29E", background: "white", borderRadius: 14, border: "1px dashed #E7E5E4" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No orders found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Your order history will appear here</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredOrders.map(order => {
            const meta = STAGE_META[order.stage] || STAGE_META.PLACED;
            const isExpanded = expanded === order.id;
            const date = new Date(order.createdAt);

            return (
              <div key={order.id} style={{ background: "white", border: `1px solid ${meta.color}20`, borderRadius: 14, overflow: "hidden" }}>
                {/* Order Header */}
                <div onClick={() => setExpanded(isExpanded ? null : order.id)}
                  style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: meta.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1C1917" }}>Order #{order.id}</div>
                      <div style={{ fontSize: 11, color: "#A8A29E" }}>
                        {date.toLocaleDateString()} {date.toLocaleTimeString()} · Table {order.tableNo}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#F97316" }}>₹{order.total?.toFixed(2)}</div>
                      <div style={{ fontSize: 11, background: meta.bg, color: meta.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                        {meta.label}
                      </div>
                    </div>
                    <span style={{ color: "#D6D3D1", fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #F5F5F4", padding: "14px 18px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#78716C", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Items Ordered</div>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 12px", background: "#FAFAF8", borderRadius: 8 }}>
                        <span style={{ fontSize: 20 }}>{item.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#A8A29E" }}>₹{item.price} × {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#F97316" }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid #F5F5F4", paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                      <span style={{ color: "#1C1917" }}>Total</span>
                      <span style={{ color: "#F97316" }}>₹{order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}