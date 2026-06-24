import { useState } from "react";
import { placeOrder as apiPlaceOrder } from './api';
import Login from './Login';
import MenuManagement from './MenuManagement';
import { initiatePayment } from './Payment';
import OrderHistory from './OrderHistory';
import AdminDashboard from './AdminDashboard';

const MENU = [
  { id: 1, name: "Grilled Chicken Burger", price: 12.99, cat: "Burgers", emoji: "🍔", time: 15, desc: "Juicy grilled chicken with lettuce & house sauce" },
  { id: 2, name: "Crispy Fries", price: 4.49, cat: "Sides", emoji: "🍟", time: 8, desc: "Golden seasoned fries with dipping sauce" },
  { id: 3, name: "Margherita Pizza", price: 14.99, cat: "Pizza", emoji: "🍕", time: 20, desc: "Fresh tomato, mozzarella, basil" },
  { id: 4, name: "Caesar Salad", price: 9.99, cat: "Salads", emoji: "🥗", time: 10, desc: "Romaine, parmesan, croutons, Caesar dressing" },
  { id: 5, name: "Pasta Carbonara", price: 13.49, cat: "Pasta", emoji: "🍝", time: 18, desc: "Creamy egg sauce, pancetta, pecorino" },
  { id: 6, name: "Chocolate Lava Cake", price: 6.99, cat: "Desserts", emoji: "🍫", time: 12, desc: "Warm chocolate cake with molten center" },
  { id: 7, name: "Mango Smoothie", price: 5.49, cat: "Drinks", emoji: "🥭", time: 5, desc: "Fresh mango blended with yogurt & honey" },
  { id: 8, name: "Mushroom Risotto", price: 13.99, cat: "Mains", emoji: "🍚", time: 22, desc: "Arborio rice with wild mushrooms & truffle oil" },
];

const ORDER_STAGES = ["Placed", "Confirmed", "Preparing", "Ready", "Delivered"];

const STAGE_META = {
  Placed:    { color: "#6366F1", bg: "#EEF2FF", icon: "📋" },
  Confirmed: { color: "#F59E0B", bg: "#FFFBEB", icon: "✅" },
  Preparing: { color: "#EF4444", bg: "#FEF2F2", icon: "👨‍🍳" },
  Ready:     { color: "#10B981", bg: "#ECFDF5", icon: "🔔" },
  Delivered: { color: "#64748B", bg: "#F8FAFC", icon: "🎉" },
};

export default function FoodApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("customer");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [tableNo, setTableNo] = useState("T-04");
  const [customerName, setCustomerName] = useState("John");

  const handleLogin = (userData) => { setUser(userData); };
  const handleLogout = () => { localStorage.clear(); setUser(null); };

  if (!user) return <Login onLogin={handleLogin} />;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`${item.emoji} ${item.name} added`);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const changeQty = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));

  const placeOrder = () => {
    if (cart.length === 0) return;
    const amount = (cartTotal * 1.05).toFixed(2);

    const handlePaymentSuccess = async (paymentId) => {
      const order = {
        customerName: customerName,
        tableNo: tableNo,
        total: parseFloat(amount),
        items: cart.map(c => ({
          name: c.name,
          emoji: c.emoji,
          quantity: c.qty,
          price: c.price
        }))
      };
      try {
        const saved = await apiPlaceOrder(order);
        const stageMap = {
          PLACED: "Placed", CONFIRMED: "Confirmed",
          PREPARING: "Preparing", READY: "Ready", DELIVERED: "Delivered"
        };
        const mappedStage = stageMap[saved.stage] || "Placed";
        setOrders(prev => [{
          ...saved,
          stage: mappedStage,
          placedAt: new Date(),
          stageHistory: [{ stage: "Placed", time: new Date() }],
          items: cart
        }, ...prev]);
        setActiveOrder(saved.id);
        setCart([]);
        showToast("🎉 Payment successful! Order placed!");
      } catch (err) {
        showToast("Order error!", "error");
      }
    };

    const handlePaymentFailure = (error) => {
      showToast(error, "error");
    };

    initiatePayment(amount, customerName, handlePaymentSuccess, handlePaymentFailure);
  };

  const advanceStage = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = ORDER_STAGES.indexOf(o.stage);
      if (idx >= ORDER_STAGES.length - 1) return o;
      const next = ORDER_STAGES[idx + 1];
      return { ...o, stage: next, stageHistory: [...o.stageHistory, { stage: next, time: new Date() }] };
    }));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cats = ["All", ...new Set(MENU.map(m => m.cat))];
  const filteredMenu = filterCat === "All" ? MENU : MENU.filter(m => m.cat === filterCat);
  const activeOrderData = orders.find(o => o.id === activeOrder);
  const kitchenOrders = orders.filter(o => o.stage !== "Delivered");

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Inter', system-ui, sans-serif", color: "#1C1917" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toast.type === "success" ? "#1C1917" : "#EF4444", color: "white", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}
      <div style={{ background: "#1C1917", borderBottom: "1px solid #292524" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🍽️</span>
            <span style={{ color: "#FAFAF8", fontWeight: 700, fontSize: 16 }}>Saveur</span>
            <span style={{ color: "#78716C", fontSize: 12 }}>Table {tableNo}</span>
            <span style={{ color: "#78716C", fontSize: 12 }}>👤 {user.name}</span>
            <button onClick={handleLogout} style={{ background: "#292524", color: "#A8A29E", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Logout</button>
          </div>
          <div style={{ display: "flex", background: "#292524", borderRadius: 8, padding: 3, gap: 2 }}>
           {["customer", "hotel", "menu", "history", "admin"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#F97316" : "transparent", color: view === v ? "white" : "#A8A29E", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {v === "customer" ? "🛒 Customer" : v === "hotel" ? "👨‍🍳 Kitchen" : v === "menu" ? "🍽️ Menu" : v === "history" ? "📋 My Orders" : "👑 Admin"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "customer" ? (
        <CustomerView
          menu={filteredMenu} cats={cats} filterCat={filterCat} setFilterCat={setFilterCat}
          cart={cart} cartTotal={cartTotal} cartCount={cartCount}
          addToCart={addToCart} removeFromCart={removeFromCart} changeQty={changeQty}
          placeOrder={placeOrder} activeOrderData={activeOrderData}
          customerName={customerName} setCustomerName={setCustomerName}
          tableNo={tableNo} setTableNo={setTableNo}
        />
      ) : view === "hotel" ? (
        <KitchenView orders={kitchenOrders} allOrders={orders} advanceStage={advanceStage} />
      ) : view === "menu" ? (
        <MenuManagement />
      ) : view === "history" ? (
        <OrderHistory />
      ) : (
        <AdminDashboard />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function CustomerView({ menu, cats, filterCat, setFilterCat, cart, cartTotal, cartCount, addToCart, removeFromCart, changeQty, placeOrder, activeOrderData, customerName, setCustomerName, tableNo, setTableNo }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
      <div>
        {activeOrderData && activeOrderData.stage !== "Delivered" && (
          <OrderTracker order={activeOrderData} />
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? "#F97316" : "white", color: filterCat === c ? "white" : "#78716C", border: "1px solid #E7E5E4", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {menu.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <div key={item.id} style={{ background: "white", border: "1px solid #F5F5F4", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", height: 80, fontSize: 42 }}>{item.emoji}</div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#A8A29E", marginBottom: 10 }}>{item.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#F97316" }}>${item.price.toFixed(2)}</span>
                      <span style={{ fontSize: 10, color: "#D6D3D1", marginLeft: 6 }}>~{item.time}m</span>
                    </div>
                    {inCart ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF7ED", borderRadius: 8, padding: "3px 6px" }}>
                        <button onClick={() => inCart.qty === 1 ? removeFromCart(item.id) : changeQty(item.id, -1)} style={{ width: 20, height: 20, border: "none", background: "#F97316", color: "white", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#F97316", minWidth: 14, textAlign: "center" }}>{inCart.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} style={{ width: 20, height: 20, border: "none", background: "#F97316", color: "white", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} style={{ background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #F5F5F4", borderRadius: 14, padding: 18, position: "sticky", top: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Your Order</span>
          {cartCount > 0 && <span style={{ background: "#F97316", color: "white", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{cartCount}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your name" style={{ flex: 1, border: "1px solid #E7E5E4", borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none" }} />
          <input value={tableNo} onChange={e => setTableNo(e.target.value)} placeholder="Table" style={{ width: 60, border: "1px solid #E7E5E4", borderRadius: 8, padding: "7px 8px", fontSize: 12, outline: "none", textAlign: "center" }} />
        </div>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#A8A29E" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
            <div style={{ fontSize: 13 }}>Your cart is empty</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Add items from the menu</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#FAFAF8", borderRadius: 8 }}>
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#A8A29E" }}>×{item.qty} · ${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => item.qty === 1 ? removeFromCart(item.id) : changeQty(item.id, -1)} style={{ width: 18, height: 18, border: "1px solid #E7E5E4", background: "white", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>−</button>
                    <button onClick={() => changeQty(item.id, 1)} style={{ width: 18, height: 18, border: "1px solid #E7E5E4", background: "white", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #F5F5F4", paddingTop: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#78716C", marginBottom: 6 }}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#78716C", marginBottom: 6 }}>
                <span>Service charge (5%)</span><span>${(cartTotal * 0.05).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, marginTop: 8 }}>
                <span>Total</span><span style={{ color: "#F97316" }}>${(cartTotal * 1.05).toFixed(2)}</span>
              </div>
            </div>
            <button onClick={placeOrder} style={{ width: "100%", background: "#F97316", color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              💳 Pay & Order →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OrderTracker({ order }) {
  const stageIdx = ORDER_STAGES.indexOf(order.stage);
  const msgs = {
    Placed: "Your order is received!",
    Confirmed: "Kitchen confirmed your order 👍",
    Preparing: "Chef is cooking your food 👨‍🍳",
    Ready: "Your food is ready! 🔔",
    Delivered: "Enjoy your meal! 🎉"
  };
  return (
    <div style={{ background: "white", border: "2px solid #FED7AA", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Order #{order.id}</div>
        <div style={{ fontSize: 11, color: "#A8A29E" }}>Table {order.tableNo}</div>
      </div>
      <div style={{ fontSize: 12, color: "#F97316", fontWeight: 600, marginBottom: 12 }}>{msgs[order.stage]}</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {ORDER_STAGES.filter(s => s !== "Delivered").map((s, i) => {
          const done = i <= stageIdx;
          const active = i === stageIdx;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#F97316" : "#F5F5F4", border: `2px solid ${done ? "#F97316" : "#E7E5E4"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, animation: active ? "pulse 1.5s infinite" : "none" }}>
                  {done ? "✓" : <span style={{ color: "#D6D3D1" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 9, color: done ? "#F97316" : "#D6D3D1", fontWeight: done ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < 3 && <div style={{ height: 2, flex: 1, background: i < stageIdx ? "#F97316" : "#F5F5F4", margin: "0 4px", marginBottom: 14 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KitchenView({ orders, allOrders, advanceStage }) {
  const delivered = allOrders.filter(o => o.stage === "Delivered").length;
  const revenue = allOrders.reduce((s, o) => s + o.total, 0);
  const NEXT_ACTION = { Placed: "Confirm Order", Confirmed: "Start Cooking", Preparing: "Mark Ready", Ready: "Mark Delivered" };
  const NEXT_COLOR  = { Placed: "#6366F1", Confirmed: "#F59E0B", Preparing: "#10B981", Ready: "#64748B" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active Orders", val: orders.length, color: "#F97316", bg: "#FFF7ED" },
          { label: "Delivered", val: delivered, color: "#10B981", bg: "#ECFDF5" },
          { label: "In Kitchen", val: orders.filter(o => o.stage === "Preparing").length, color: "#EF4444", bg: "#FEF2F2" },
          { label: "Revenue", val: `$${revenue.toFixed(0)}`, color: "#6366F1", bg: "#EEF2FF" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#78716C", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      {orders.length === 0 ? (
        <div style={{ background: "white", border: "1px dashed #E7E5E4", borderRadius: 14, padding: "60px", textAlign: "center", color: "#A8A29E" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🍳</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Kitchen is quiet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Waiting for customer orders...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {orders.map(order => {
            const meta = STAGE_META[order.stage];
            const elapsed = Math.floor((Date.now() - order.placedAt) / 1000 / 60);
            return (
              <div key={order.id} style={{ background: "white", border: `2px solid ${meta.color}30`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: meta.bg, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Order #{order.id}</div>
                    <div style={{ fontSize: 11, color: "#78716C" }}>Table {order.tableNo} · {order.customerName}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18 }}>{meta.icon}</div>
                    <div style={{ fontSize: 10, color: elapsed > 20 ? "#EF4444" : "#A8A29E" }}>{elapsed}m ago</div>
                  </div>
                </div>
                <div style={{ padding: "12px 16px" }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{item.emoji}</span>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{item.name}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, background: "#F5F5F4", borderRadius: 5, padding: "2px 7px" }}>×{item.quantity || item.qty}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0 16px 10px" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {ORDER_STAGES.map(s => {
                      const done = order.stageHistory.some(h => h.stage === s);
                      return <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: done ? meta.color : "#F5F5F4" }} />;
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>{meta.icon} {order.stage}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#F97316" }}>${order.total?.toFixed(2)}</span>
                  </div>
                </div>
                {order.stage !== "Delivered" && (
                  <div style={{ padding: "0 16px 14px" }}>
                    <button onClick={() => advanceStage(order.id)} style={{ width: "100%", background: NEXT_COLOR[order.stage], color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {NEXT_ACTION[order.stage]} →
                    </button>
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