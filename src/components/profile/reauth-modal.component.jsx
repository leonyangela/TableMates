"use client";

import { useState } from "react";

import ModalShell from "@/components/ui/modal-shell.component";
import { FIELD } from "@/components/ui/styles";
import Button from "@/components/button/button.component";

export default function ReauthModal({ isOpen, isSubmitting, error, onConfirm, onCancel }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <ModalShell
      label="Security check"
      title="Confirm your password"
      subtitle="For your security, re-enter your password to change your email."
      onClose={onCancel}
      labelledBy="reauth-title"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reauth-password" className={FIELD.label}>
            Password
          </label>
          <input
            id="reauth-password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD.input}
          />
        </div>

        {error && (
          <p role="alert" className="border-l-2 border-coffee-bean-400 pl-4 text-sm text-coffee-bean-200">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !password}>
            {isSubmitting ? "Confirming…" : "Confirm"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
