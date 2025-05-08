export function convertToCSV(data: Record<string, any>[], columns: string[]): string {
    const csvRows = [columns.join(",")];
    for (const row of data) {
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return "";
        if (typeof val === "string" && val.includes(",")) return `"${val}"`;
        return val;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }
  
  export function downloadCSV(csv: string, filename = "data.csv") {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  