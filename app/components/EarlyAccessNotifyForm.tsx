"use client";

import { useState } from "react";

interface EarlyAccessNotifyFormProps {
  buttonText?: string;
  successMessage?: string;
}

export default function EarlyAccessNotifyForm({
  buttonText = "Notify Me When Ready 🔔",
  successMessage = "Thank you! You will be notified as soon as this series launches.",
}: EarlyAccessNotifyFormProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    alert(successMessage);
  };

  if (subscribed) {
    return (
      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 text-center my-3">
        ✓ You are registered for launch notifications!
      </div>
    );
  }

  return (
    <form className="dev-notify-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email address..."
        required
        className="dev-email-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="dev-notify-btn">
        {buttonText}
      </button>
    </form>
  );
}
