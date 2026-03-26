"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-deep-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">mail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="text-sm text-silver-metallic mt-2">
            We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-6 text-deep-green font-semibold text-sm hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-bg px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-deep-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">lock_reset</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="text-sm text-silver-metallic mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-deep-green text-white font-bold rounded-xl hover:bg-rich-green transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-silver-metallic mt-6">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-deep-green font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
