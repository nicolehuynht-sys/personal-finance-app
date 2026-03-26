"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password updated successfully");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-bg px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-deep-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">New password</h1>
          <p className="text-sm text-silver-metallic mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-deep-green text-white font-bold rounded-xl hover:bg-rich-green transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
