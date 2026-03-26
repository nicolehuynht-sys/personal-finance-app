"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { DropZone } from "@/components/import/DropZone";
import { UploadHistory } from "@/components/import/UploadHistory";
import { AccountSelector } from "@/components/import/AccountSelector";
import { createClient } from "@/lib/supabase/client";
import type { Upload, Account } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function ImportPage() {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUploads = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setUploads(data);
  }, [userId]);

  const fetchAccounts = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (data) setAccounts(data);
  }, [userId]);

  useEffect(() => {
    fetchUploads();
    fetchAccounts();
  }, [fetchUploads, fetchAccounts]);

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

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedAccountId) {
        formData.append("accountId", selectedAccountId);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Upload failed");
      } else {
        toast.success(
          `Imported ${result.imported} transactions` +
          (result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates skipped)` : "")
        );
        // Refresh upload history
        fetchUploads();
      }
    } catch (err) {
      toast.error("Upload failed — check your connection");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
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

        {/* Drop Zone + Account Selector */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <DropZone onFileSelect={handleFileSelect} isUploading={isUploading} disabled={!selectedAccountId} />
          </div>
          <div>
            <AccountSelector
              accounts={accounts}
              selectedId={selectedAccountId}
              onSelect={setSelectedAccountId}
              onCreateNew={async (name, institution) => {
                if (!userId) return;
                const { data, error } = await supabase.from("accounts").insert({
                  user_id: userId,
                  name,
                  institution: institution || null,
                  account_type: "checking",
                }).select().single();
                if (error) {
                  toast.error("Failed to create account");
                } else {
                  toast.success(`Created account: ${name}`);
                  await fetchAccounts();
                  setSelectedAccountId(data.id);
                }
              }}
            />
          </div>
        </div>

        {/* Upload History */}
        <div className="px-6 pt-12">
          <UploadHistory
            uploads={uploads}
            onDelete={async (uploadId, fileName) => {
              if (!confirm(`Delete "${fileName}" and all its transactions?`)) return;
              // Delete transactions first (foreign key), then the upload
              await supabase
                .from("transactions")
                .delete()
                .eq("upload_id", uploadId);
              const { error } = await supabase
                .from("uploads")
                .delete()
                .eq("id", uploadId);
              if (error) {
                toast.error("Failed to delete upload");
              } else {
                toast.success(`Deleted "${fileName}"`);
                fetchUploads();
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
