"use client";

import { useState } from "react";

export default function ReauthModal({ isOpen, isSubmitting, error, onConfirm, onCancel }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="font-semibold text-lg mb-1">Confirm your password</h2>
        <p className="text-sm text-gray-500 mb-4">
          For your security, please re-enter your password to change your email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}