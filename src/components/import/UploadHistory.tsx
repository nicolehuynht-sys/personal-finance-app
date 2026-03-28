"use client";

import { useState } from "react";
import type { Upload } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface UploadHistoryProps {
  uploads: Upload[];
  onDelete?: (uploadId: string, fileName: string) => void;
  onRename?: (uploadId: string, newName: string) => void;
}

const statusConfig = {
  completed: { badge: "success" as const, icon: "check_circle", label: "Synced" },
  processing: { badge: "default" as const, icon: "progress_activity", label: "Pending" },
  pending: { badge: "default" as const, icon: "schedule", label: "Queued" },
  failed: { badge: "error" as const, icon: "error", label: "Failed" },
};

export function UploadHistory({ uploads, onDelete, onRename }: UploadHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (uploads.length === 0) return null;

  const startEdit = (upload: Upload) => {
    setEditingId(upload.id);
    setEditName(upload.file_name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRename?.(editingId, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-border-silver pb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic">
          Recent Activity
        </h3>
      </div>
      <div className="space-y-3">
        {uploads.map((upload) => {
          const config = statusConfig[upload.status];
          const isFailed = upload.status === "failed";
          const accountLabel = upload.account
            ? `${upload.account.name}${upload.account.institution ? ` • ${upload.account.institution}` : ""}`
            : null;

          return (
            <div
              key={upload.id}
              className={`flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm ${
                isFailed
                  ? "bg-white/50 border-slate-100"
                  : "border-border-silver/30"
              }`}
            >
              <div
                className={`flex w-10 h-10 shrink-0 items-center justify-center rounded-full border ${
                  upload.status === "completed"
                    ? "bg-deep-green/5 border-deep-green/10"
                    : isFailed
                      ? "bg-slate-50 border-slate-100"
                      : "bg-silver-light border-border-silver/50"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] font-bold ${
                    upload.status === "completed"
                      ? "text-deep-green"
                      : isFailed
                        ? "text-slate-300"
                        : "text-silver-metallic"
                  }`}
                >
                  {config.icon}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center min-w-0">
                {editingId === upload.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 h-8 border border-silver-light rounded-lg px-2 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
                    />
                    <button
                      onClick={saveEdit}
                      className="text-deep-green hover:text-rich-green transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-silver-metallic hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p
                      className={`text-[14px] font-semibold truncate ${
                        isFailed ? "text-silver-metallic" : "text-slate-800"
                      }`}
                    >
                      {upload.file_name}
                    </p>
                    {onRename && (
                      <button
                        onClick={() => startEdit(upload)}
                        className="shrink-0 text-silver-metallic hover:text-slate-600 transition-colors"
                        title="Rename file"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {accountLabel && (
                    <>
                      <span className="material-symbols-outlined text-[11px] text-silver-metallic">account_balance</span>
                      <span className="text-[11px] text-silver-metallic font-medium">{accountLabel}</span>
                      <span className="text-[11px] text-silver-metallic">•</span>
                    </>
                  )}
                  <span className="text-silver-metallic text-[11px] uppercase tracking-wider">
                    {upload.row_count ? `${upload.row_count} Entries • ` : ""}
                    {upload.status === "completed"
                      ? "Completed"
                      : upload.status === "failed"
                        ? upload.error_message || "Error"
                        : "Processing"}
                  </span>
                </div>
              </div>

              <Badge variant={config.badge}>{config.label}</Badge>

              {onDelete && (
                <button
                  onClick={() => onDelete(upload.id, upload.file_name)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-silver-metallic hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete upload and its transactions"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
