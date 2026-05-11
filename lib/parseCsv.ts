import Papa from "papaparse";
import type { ParsedCsv, RawCsvRow } from "./types";

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const rawRows = results.data.filter((row) =>
          Object.values(row).some((v) => v && String(v).trim() !== "")
        );
        const detectedColumns = results.meta.fields?.map((f) => f.trim()) ?? [];

        if (rawRows.length === 0) {
          reject(new Error("CSV is empty or contains no valid rows."));
          return;
        }

        resolve({
          rawRows,
          detectedColumns,
          fileName: file.name,
        });
      },
      error: (err) => reject(err),
    });
  });
}
