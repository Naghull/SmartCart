import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";

const PaymentPage = ({ totalAmount, onGenerateBill }) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentSuccess(true);
      onGenerateBill();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onGenerateBill]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Simulating Payment</h2>
      <h3>Amount: ₹{totalAmount}</h3>
      <h3>Scan the QR code to pay:</h3>

      <QRCode value={`Payment for ₹${totalAmount}`} size={256} />

      <div style={{ marginTop: "20px" }}>
        {paymentSuccess ? (
          <h2>Payment Successful! Generating Bill...</h2>
        ) : (
          <h3>Please complete the payment by scanning the QR code</h3>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
