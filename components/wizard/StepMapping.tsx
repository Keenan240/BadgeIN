"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { autoDetectMapping } from "@/lib/autoDetect";
import { badgeSubtitle } from "@/lib/badgeSubtitle";
import { cn } from "@/lib/cn";
import { normalizeLinkedIn } from "@/lib/normalizeLinkedIn";
import type { ColumnMapping, ParsedCsv } from "@/lib/types";

interface StepMappingProps {
  parsed: ParsedCsv;
  mapping: Partial<ColumnMapping> | null;
  onMapped: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

const NONE_VALUE = "__none__";

const FIELDS: {
  key: keyof ColumnMapping;
  label: string;
  required: boolean;
  helper: string;
}[] = [
  { key: "name", label: "Name", required: true, helper: "Shown large on the badge." },
  { key: "linkedin", label: "LinkedIn URL", required: true, helper: "QR code links here." },
  { key: "position", label: "Position", required: false, helper: "Job title (optional)." },
  { key: "company", label: "Company", required: false, helper: "Employer (optional)." },
];

export function StepMapping({
  parsed,
  mapping: initialMapping,
  onMapped,
  onBack,
}: StepMappingProps) {
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>(
    () => initialMapping ?? autoDetectMapping(parsed.detectedColumns)
  );

  useEffect(() => {
    if (!initialMapping) {
      setMapping(autoDetectMapping(parsed.detectedColumns));
    }
  }, [parsed.detectedColumns, initialMapping]);

  const updateField = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (value === NONE_VALUE) {
        delete next[field];
      } else {
        next[field] = value;
      }
      return next;
    });
  };

  const isValid = Boolean(mapping.name && mapping.linkedin);

  const allPreviewRows = useMemo(() => {
    return parsed.rawRows.map((row) => ({
      name: mapping.name ? (row[mapping.name] ?? "") : "",
      position: mapping.position ? (row[mapping.position] ?? "") : "",
      company: mapping.company ? (row[mapping.company] ?? "") : "",
      linkedin: mapping.linkedin
        ? normalizeLinkedIn(row[mapping.linkedin] ?? "")
        : "",
    }));
  }, [parsed.rawRows, mapping]);

  const autoDetected = useMemo(
    () => autoDetectMapping(parsed.detectedColumns),
    [parsed.detectedColumns]
  );

  const handleContinue = () => {
    if (!isValid) return;
    onMapped(mapping as ColumnMapping);
  };

  return (
    <div className="flex flex-col gap-8 pb-8 md:h-[calc(100vh-180px)] md:flex-row md:gap-10 md:pb-0">
      {/* ── Left panel: controls ── */}
      <div className="flex w-full shrink-0 flex-col gap-5 py-2 md:w-[340px] md:overflow-y-auto">
        <div>
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <h2 className="text-2xl font-medium tracking-tight">Map your columns</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tell us which columns hold each piece of attendee info. We&apos;ve
            guessed where we could.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FIELDS.map((field) => {
            const wasAutoDetected =
              autoDetected[field.key] &&
              autoDetected[field.key] === mapping[field.key];

            return (
              <div key={field.key} className="rounded-xl border p-4 bg-card">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </label>
                  {wasAutoDetected && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      Auto-detected
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{field.helper}</p>
                <Select
                  value={mapping[field.key] ?? NONE_VALUE}
                  onChange={(e) => updateField(field.key, e.target.value)}
                >
                  {!field.required && (
                    <option value={NONE_VALUE}>— none —</option>
                  )}
                  {field.required && !mapping[field.key] && (
                    <option value={NONE_VALUE} disabled>
                      Select a column…
                    </option>
                  )}
                  {parsed.detectedColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          Generate badges
        </Button>
      </div>

      {/* ── Right panel: full attendee preview, independently scrollable ── */}
      <div className="min-w-0 border-t pt-8 md:flex-1 md:overflow-y-auto md:border-t-0 md:py-2 md:pl-10">
        <div className="max-w-xl md:max-w-none">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-secondary/40 flex items-center justify-between">
              <span className="text-sm font-medium">Attendee preview</span>
              <span className="text-xs text-muted-foreground">
                {parsed.rawRows.length} row{parsed.rawRows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 border-b">#</th>
                    <th className="text-left font-medium px-3 py-2 border-b">Name</th>
                    <th className="text-left font-medium px-3 py-2 border-b">Subtitle</th>
                    <th className="text-left font-medium px-3 py-2 border-b">LinkedIn</th>
                  </tr>
                </thead>
                <tbody>
                  {allPreviewRows.map((row, i) => {
                    const subtitle = badgeSubtitle({
                      position: row.position || undefined,
                      company: row.company || undefined,
                    });
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">
                          {i + 1}
                        </td>
                        <td className={cn("px-3 py-2 font-medium", !row.name && "text-red-500")}>
                          {row.name || "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {subtitle ?? "—"}
                        </td>
                        <td className={cn(
                          "px-3 py-2 font-mono text-[11px] truncate max-w-[200px]",
                          row.linkedin ? "text-emerald-600" : "text-red-500"
                        )}>
                          {row.linkedin || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
