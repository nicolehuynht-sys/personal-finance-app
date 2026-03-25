"use client";

import { useState } from "react";
import type { Account } from "@/lib/types";

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreateNew: (name: string, institution: string) => void;
}

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  onCreateNew,
}: AccountSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInstitution, setNewInstitution] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateNew(newName.trim(), newInstitution.trim());
    setShowCreate(false);
    setNewName("");
    setNewInstitution("");
  };

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic">
        Link to Account
      </label>

      <select
        value={selectedId || ""}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setShowCreate(true);
            onSelect(null);
          } else {
            onSelect(e.target.value || null);
          }
        }}
        className="w-full h-12 bg-white border border-silver-light rounded-xl px-4 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-deep-green focus:border-deep-green"
      >
        <option value="">No account (optional)</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
            {acc.institution ? ` — ${acc.institution}` : ""}
          </option>
        ))}
        <option value="__new__">+ Create new account</option>
      </select>

      {showCreate && (
        <div className="p-4 bg-slate-50 rounded-xl border border-silver-light space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Account name (e.g. Chase Checking)"
            className="w-full h-10 bg-white border border-silver-light rounded-lg px-3 text-sm focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          />
          <input
            type="text"
            value={newInstitution}
            onChange={(e) => setNewInstitution(e.target.value)}
            placeholder="Bank name (e.g. Chase)"
            className="w-full h-10 bg-white border border-silver-light rounded-lg px-3 text-sm focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 h-9 text-sm font-medium text-silver-metallic border border-silver-light rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 h-9 text-sm font-bold text-white bg-deep-green rounded-lg hover:bg-rich-green transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
