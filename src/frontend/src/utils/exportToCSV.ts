/**
 * Convert an array of objects to a CSV blob and trigger a download.
 *
 * @param data     Array of objects to export.
 * @param fields   The keys (in order) to include as columns.
 * @param filename The .csv filename to download.
 */
export function exportToCSV(data: Record<string, any>[], fields: string[], filename: string) {
  // 1) Header row
  const header = fields.join(',');

  // 2) Data rows
  const rows = data.map((item) =>
    fields
      .map((field) => {
        let v = item[field];
        if (v == null) return '';            // null or undefined → empty
        const str = String(v).replace(/"/g, '""');
        return `"${str}"`;                   // wrap in double-quotes
      })
      .join(',')
  );

  // 3) Join into one CSV string
  const csvContent = [header, ...rows].join('\r\n');

  // 4) Create blob & auto-download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
