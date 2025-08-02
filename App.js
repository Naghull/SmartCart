import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

// Product price map
const PRODUCTS = {
  "Grape nector juice": 60,
  "Colgate toothpaste": 40,
  "Lifebuoy soap": 25,
  "Pringles": 90,
  "Lays": 20,
  "Coca Cola": 35,
  "Fanta": 35,
  "Chocolate Chip": 50,
  "oreo": 45,
};

function App() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [topPrediction, setTopPrediction] = useState("");
  const [cart, setCart] = useState([]);
  const lastDetectedRef = useRef(null);
  const lastDetectedTimeRef = useRef(0);

  const modelURL = process.env.PUBLIC_URL + "/model/";

  // Load Teachable Machine model
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tmImage.load(
        modelURL + "model.json",
        modelURL + "metadata.json"
      );
      setModel(loadedModel);
    };
    loadModel();
  }, [modelURL]);

  // Camera setup and prediction loop
  useEffect(() => {
    if (!model) return;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        videoRef.current.onloadeddata = () => {
          requestAnimationFrame(predictLoop);
        };
      } catch (err) {
        console.error("Camera access denied or error:", err);
      }
    };

    const predictLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const prediction = await model.predict(videoRef.current);
        const top = prediction.reduce((max, p) =>
          p.probability > max.probability ? p : max
        );

        const cleanedClassName = top.className.trim();
        const now = Date.now();
        if (
          top.probability > 0.98 &&
          cleanedClassName.toLowerCase() !== "background" &&
          cleanedClassName.toLowerCase() !== "nothing"
        ) {
          if (
            cleanedClassName !== lastDetectedRef.current ||
            now - lastDetectedTimeRef.current > 3000
          ) {
            setTopPrediction(cleanedClassName);

            if (PRODUCTS.hasOwnProperty(cleanedClassName)) {
              addToCart(cleanedClassName);
              lastDetectedRef.current = cleanedClassName;
              lastDetectedTimeRef.current = now;
            } else {
              console.warn(`Unknown item detected: "${cleanedClassName}"`);
            }
          }
        }
      }

      requestAnimationFrame(predictLoop);
    };

    setupCamera();
  }, [model]);

  // Add item to cart
  const addToCart = (item) => {
    const price = PRODUCTS[item];
    if (price === undefined) return;

    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.name === item);
      if (existing) {
        return prevCart.map((p) =>
          p.name === item ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        return [...prevCart, { name: item, price, quantity: 1 }];
      }
    });
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Total cost
  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Smart Shopping Cart System</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          marginTop: "20px",
        }}
      >
        {/* Left side - Camera */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <video
            ref={videoRef}
            width="400"
            height="300"
            autoPlay
            muted
            playsInline
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          />
          <h3 style={{ marginTop: "10px" }}>
            Detected: <span style={{ color: "#007bff" }}>{topPrediction || "None"}</span>
          </h3>
        </div>

        {/* Right side - Cart */}
        <div style={{ flex: 1 }}>
          <h2>🛒 Cart</h2>
          {cart.length === 0 ? (
            <p>No items yet</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ccc",
              }}
            >
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={{ marginTop: "15px" }}>Total: ₹{getTotal()}</h3>

          <div style={{ marginTop: "10px" }}>
            <button onClick={clearCart} style={{ marginRight: "10px" }}>
              Clear Cart
            </button>
            <button
              onClick={() => alert("Proceeding to payment...")}
              disabled={cart.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
