import type { Upload } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface UploadHistoryProps {
  uploads: Upload[];
  onDelete?: (uploadId: string, fileName: string) => void;
}

const statusConfig = {
  completed: { badge: "success" as const, icon: "check_circle", label: "Synced" },
  processing: { badge: "default" as const, icon: "progress_activity", label: "Pending" },
  pending: { badge: "default" as const, icon: "schedule", label: "Queued" },
  failed: { badge: "error" as const, icon: "error", label: "Failed" },
};

export function UploadHistory({ uploads, onDelete }: UploadHistoryProps) {
  if (uploads.length === 0) return null;

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
                <p
                  className={`text-[14px] font-semibold truncate ${
                    isFailed ? "text-silver-metallic" : "text-slate-800"
                  }`}
                >
                  {upload.file_name}
                </p>
                <p className="text-silver-metallic text-[11px] mt-0.5 uppercase tracking-wider">
                  {upload.row_count ? `${upload.row_count} Entries • ` : ""}
                  {upload.status === "completed"
                    ? "Completed"
                    : upload.status === "failed"
                      ? upload.error_message || "Error"
                      : "Processing"}
                </p>
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
