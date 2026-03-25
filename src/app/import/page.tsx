"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DropZone } from "@/components/import/DropZone";
import { UploadHistory } from "@/components/import/UploadHistory";
import { AccountSelector } from "@/components/import/AccountSelector";
import type { Upload, Account } from "@/lib/types";
import toast from "react-hot-toast";

// Sample data for display
const SAMPLE_UPLOADS: Upload[] = [
  {
    id: "1",
    user_id: "",
    account_id: null,
    file_name: "Quarterly_Statement.csv",
    file_path: "",
    file_size_bytes: 24000,
    mime_type: "text/csv",
    status: "completed",
    row_count: 142,
    error_message: null,
    created_at: "2024-10-20T00:00:00Z",
    completed_at: "2024-10-20T00:01:00Z",
  },
  {
    id: "2",
    user_id: "",
    account_id: null,
    file_name: "Amex_Black_Nov.xlsx",
    file_path: "",
    file_size_bytes: 18000,
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "processing",
    row_count: null,
    error_message: null,
    created_at: "2024-10-24T00:00:00Z",
    completed_at: null,
  },
  {
    id: "3",
    user_id: "",
    account_id: null,
    file_name: "Export_Draft_02.csv",
    file_path: "",
    file_size_bytes: 5000,
    mime_type: "text/csv",
    status: "failed",
    row_count: null,
    error_message: "Format Mismatch",
    created_at: "2024-10-22T00:00:00Z",
    completed_at: null,
  },
];

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploads] = useState<Upload[]>(SAMPLE_UPLOADS);
  const [accounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV or XLSX file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setIsUploading(true);
    toast.success(`Selected: ${file.name}`);

    // TODO: Actually upload to Supabase Storage and call /api/upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success("File processed (demo mode)");
    }, 2000);
  };

  return (
    <>
      <Header title="Import" showBack />

      <div className="pb-32 lg:pb-8 max-w-3xl mx-auto">
        {/* Title */}
        <div className="px-8 pt-10 pb-8 text-center">
          <h2 className="text-deep-green text-3xl font-bold tracking-tight">
            File Upload
          </h2>
          <p className="text-silver-metallic text-[14px] mt-3 leading-relaxed max-w-[280px] mx-auto">
            Upload your statements to sync with our secure analytics.
          </p>
        </div>

        {/* Drop Zone + Account Selector — side by side on desktop */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <DropZone onFileSelect={handleFileSelect} isUploading={isUploading} />
          </div>
          <div>
            <AccountSelector
              accounts={accounts}
              selectedId={selectedAccountId}
              onSelect={setSelectedAccountId}
              onCreateNew={(name, institution) => {
                // TODO: create in Supabase
                toast.success(`Created account: ${name}`);
              }}
            />
          </div>
        </div>

        {/* Upload History */}
        <div className="px-6 pt-12">
          <UploadHistory uploads={uploads} />
        </div>
      </div>
    </>
  );
}
