"use client";

import { useState } from "react";
import type { Account } from "@/lib/types";

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreateNew: (name: string, institution: string) => void;
  onEdit?: (id: string, name: string, institution: string) => void;
  onDelete?: (id: string, name: string) => void;
}

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
}: AccountSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [showManage, setShowManage] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateNew(newName.trim(), newInstitution.trim());
    setShowCreate(false);
    setNewName("");
    setNewInstitution("");
  };

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditInstitution(acc.institution || "");
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onEdit?.(editingId, editName.trim(), editInstitution.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic">
          Link to Account
        </label>
        {accounts.length > 0 && (
          <button
            onClick={() => setShowManage(!showManage)}
            className="text-[11px] font-bold text-deep-green uppercase tracking-wider hover:underline"
          >
            {showManage ? "Done" : "Edit"}
          </button>
        )}
      </div>

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
        <option value="">Select an account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
            {acc.institution ? ` — ${acc.institution}` : ""}
          </option>
        ))}
        <option value="__new__">+ Create new account</option>
      </select>

      {/* Manage accounts list */}
      {showManage && (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-3 bg-slate-50 rounded-xl border border-silver-light">
              {editingId === acc.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Account name"
                    className="w-full h-9 bg-white border border-silver-light rounded-lg px-3 text-sm focus:ring-1 focus:ring-deep-green focus:border-deep-green"
                  />
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    placeholder="Bank name"
                    className="w-full h-9 bg-white border border-silver-light rounded-lg px-3 text-sm focus:ring-1 focus:ring-deep-green focus:border-deep-green"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 h-8 text-xs font-medium text-silver-metallic border border-silver-light rounded-lg hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 h-8 text-xs font-bold text-white bg-deep-green rounded-lg hover:bg-rich-green"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{acc.name}</p>
                    {acc.institution && (
                      <p className="text-xs text-silver-metallic">{acc.institution}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(acc)}
                      className="text-silver-metallic hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                    </button>
                    <button
                      onClick={() => onDelete?.(acc.id, acc.name)}
                      className="text-silver-metallic hover:text-rose-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="p-4 bg-slate-50 rounded-xl border border-silver-light space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Account name (e.g. Scotiabank Chequing)"
            className="w-full h-10 bg-white border border-silver-light rounded-lg px-3 text-sm focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          />
          <input
            type="text"
            value={newInstitution}
            onChange={(e) => setNewInstitution(e.target.value)}
            placeholder="Bank name (e.g. Scotiabank)"
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
