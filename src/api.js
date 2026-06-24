const BASE = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

export const placeOrder = (order) =>
  fetch(`${BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(order)
  }).then(r => r.json());

export const advanceStage = (id) =>
  fetch(`${BASE}/orders/${id}/stage`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  }).then(r => r.json());

export const getActiveOrders = () =>
  fetch(`${BASE}/orders/active`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  }).then(r => r.json());