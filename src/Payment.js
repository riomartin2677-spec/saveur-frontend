const BASE = "http://localhost:8080/api";
const getToken = () => localStorage.getItem("token");

export const initiatePayment = async (amount, customerName, onSuccess, onFailure) => {
  try {
    // Step 1 — Create order on backend
    const res = await fetch(`${BASE}/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ amount })
    });

    const data = await res.json();

    // Step 2 — Open Razorpay popup
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Saveur Restaurant",
      description: "Food Order Payment",
      order_id: data.orderId,
      handler: async (response) => {
        // Step 3 — Verify payment
        const verifyRes = await fetch(`${BASE}/payment/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyRes.json();

        if (verifyData.status === "success") {
          onSuccess(verifyData.paymentId);
        } else {
          onFailure("Payment verification failed!");
        }
      },
      prefill: {
        name: customerName,
      },
      theme: {
        color: "#F97316"
      },
      modal: {
        ondismiss: () => onFailure("Payment cancelled!")
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    onFailure("Payment error: " + err.message);
  }
};