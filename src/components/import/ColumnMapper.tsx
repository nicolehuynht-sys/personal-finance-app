"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";

export type ColumnMapping = {
  date: string;
  description: string;
  amount: string;
  credit: string;       // For split debit/credit columns
  debit: string;        // For split debit/credit columns
  amountSign: "natural" | "inverted"; // Amex-style: charges are positive
};

interface ColumnMapperProps {
  fileName: string;
  headers: string[];
  sampleRows: Record<string, string>[];
  suggestedMapping: Partial<ColumnMapping>;
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
  isUploading: boolean;
}

const REQUIRED_FIELDS = [
  { key: "date" as const, label: "Date", icon: "calendar_today", description: "Transaction date" },
  { key: "description" as const, label: "Description", icon: "description", description: "Merchant / payee name" },
];

const AMOUNT_FIELDS = [
  { key: "amount" as const, label: "Amount", icon: "payments", description: "Single amount column (negative = expense)" },
  { key: "debit" as const, label: "Debit (Expense)", icon: "remove_circle", description: "Separate withdrawal column" },
  { key: "credit" as const, label: "Credit (Income)", icon: "add_circle", description: "Separate deposit column" },
];

const UNMAPPED = "__unmapped__";

export function ColumnMapper({
  fileName,
  headers,
  sampleRows,
  suggestedMapping,
  onConfirm,
  onCancel,
  isUploading,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: suggestedMapping.date || UNMAPPED,
    description: suggestedMapping.description || UNMAPPED,
    amount: suggestedMapping.amount || UNMAPPED,
    credit: suggestedMapping.credit || UNMAPPED,
    debit: suggestedMapping.debit || UNMAPPED,
    amountSign: suggestedMapping.amountSign || "natural",
  });

  const [amountMode, setAmountMode] = useState<"single" | "split">(
    suggestedMapping.debit && suggestedMapping.debit !== UNMAPPED ? "split" : "single"
  );

  // Validate: date + description required, plus either amount or both debit+credit
  const isValid = useMemo(() => {
    const hasDate = mapping.date !== UNMAPPED;
    const hasDesc = mapping.description !== UNMAPPED;
    const hasAmount = amountMode === "single"
      ? mapping.amount !== UNMAPPED
      : (mapping.debit !== UNMAPPED && mapping.credit !== UNMAPPED);
    return hasDate && hasDesc && hasAmount;
  }, [mapping, amountMode]);

  const handleConfirm = () => {
    const finalMapping = { ...mapping };
    if (amountMode === "single") {
      finalMapping.credit = UNMAPPED;
      finalMapping.debit = UNMAPPED;
    } else {
      finalMapping.amount = UNMAPPED;
    }
    onConfirm(finalMapping);
  };

  // Get sample values for a column
  const getSampleValues = (colName: string) => {
    if (colName === UNMAPPED) return [];
    return sampleRows.slice(0, 3).map((row) => row[colName] || "—").filter(Boolean);
  };

  return (
    <div className="bg-white rounded-2xl border border-silver-light shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-silver-light bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-deep-green/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-deep-green text-xl">table_chart</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Map Columns</h3>
            <p className="text-xs text-silver-metallic mt-0.5">
              {fileName} — {headers.length} columns, {sampleRows.length}+ rows
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Required fields */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic mb-3">
            Required Fields
          </p>
          <div className="space-y-3">
            {REQUIRED_FIELDS.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                value={mapping[field.key]}
                headers={headers}
                sampleValues={getSampleValues(mapping[field.key])}
                onChange={(val) => setMapping((prev) => ({ ...prev, [field.key]: val }))}
              />
            ))}
          </div>
        </div>

        {/* Amount mode toggle */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic mb-3">
            Amount Format
          </p>
          <div className="flex bg-slate-100 rounded-lg p-0.5 mb-3">
            <button
              onClick={() => setAmountMode("single")}
              className={`flex-1 px-3 py-2 text-[12px] font-bold rounded-md transition-colors ${
                amountMode === "single" ? "bg-white text-deep-green shadow-sm" : "text-silver-metallic"
              }`}
            >
              Single Amount Column
            </button>
            <button
              onClick={() => setAmountMode("split")}
              className={`flex-1 px-3 py-2 text-[12px] font-bold rounded-md transition-colors ${
                amountMode === "split" ? "bg-white text-deep-green shadow-sm" : "text-silver-metallic"
              }`}
            >
              Separate Debit / Credit
            </button>
          </div>

          <div className="space-y-3">
            {amountMode === "single" ? (
              <FieldRow
                field={AMOUNT_FIELDS[0]}
                value={mapping.amount}
                headers={headers}
                sampleValues={getSampleValues(mapping.amount)}
                onChange={(val) => setMapping((prev) => ({ ...prev, amount: val }))}
              />
            ) : (
              <>
                <FieldRow
                  field={AMOUNT_FIELDS[1]}
                  value={mapping.debit}
                  headers={headers}
                  sampleValues={getSampleValues(mapping.debit)}
                  onChange={(val) => setMapping((prev) => ({ ...prev, debit: val }))}
                />
                <FieldRow
                  field={AMOUNT_FIELDS[2]}
                  value={mapping.credit}
                  headers={headers}
                  sampleValues={getSampleValues(mapping.credit)}
                  onChange={(val) => setMapping((prev) => ({ ...prev, credit: val }))}
                />
              </>
            )}

            {/* Sign convention */}
            <div className="mt-2 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic mb-2">
                Sign Convention
              </p>
              <div className="space-y-2 pl-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="amountSign"
                    checked={mapping.amountSign === "natural"}
                    onChange={() => setMapping((prev) => ({ ...prev, amountSign: "natural" }))}
                    className="w-4 h-4 border-silver-light text-deep-green focus:ring-deep-green"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Expenses are negative, income is positive
                    </span>
                    <p className="text-[10px] text-silver-metallic">
                      Standard format — e.g. -$50.00 for a purchase, +$1000.00 for a deposit
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="amountSign"
                    checked={mapping.amountSign === "inverted"}
                    onChange={() => setMapping((prev) => ({ ...prev, amountSign: "inverted" }))}
                    className="w-4 h-4 border-silver-light text-deep-green focus:ring-deep-green"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Charges are positive, payments are negative
                    </span>
                    <p className="text-[10px] text-silver-metallic">
                      Credit card format (e.g., Amex, some Visa) — $50.00 = expense, -$50.00 = payment
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data preview */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic mb-3">
            Preview (first 3 rows)
          </p>
          <div className="overflow-x-auto rounded-xl border border-silver-light">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {headers.map((h) => {
                    const mappedTo = Object.entries(mapping).find(([, v]) => v === h)?.[0];
                    return (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-silver-light whitespace-nowrap">
                        <div>{h}</div>
                        {mappedTo && mappedTo !== "amountSign" && (
                          <span className="text-[10px] font-bold text-deep-green uppercase">
                            → {mappedTo}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sampleRows.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-b border-silver-light last:border-0">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-silver-light bg-slate-50/30 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleConfirm} disabled={!isValid || isUploading}>
          {isUploading ? "Importing..." : "Import Transactions"}
        </Button>
      </div>
    </div>
  );
}

function FieldRow({
  field,
  value,
  headers,
  sampleValues,
  onChange,
}: {
  field: { key: string; label: string; icon: string; description: string };
  value: string;
  headers: string[];
  sampleValues: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-deep-green/5 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[16px] text-deep-green">{field.icon}</span>
      </div>
      <div className="w-28 shrink-0">
        <p className="text-sm font-semibold text-slate-800">{field.label}</p>
        <p className="text-[10px] text-silver-metallic">{field.description}</p>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="material-symbols-outlined text-silver-metallic text-sm">arrow_forward</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 h-9 border rounded-lg px-3 text-[13px] font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green ${
            value === UNMAPPED
              ? "border-rose-200 bg-rose-50/30 text-rose-400"
              : "border-silver-light bg-white text-slate-700"
          }`}
        >
          <option value={UNMAPPED}>— Select column —</option>
          {headers.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
      {sampleValues.length > 0 && (
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-silver-metallic font-medium bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
            e.g. {sampleValues[0]}
          </span>
        </div>
      )}
    </div>
  );
}
