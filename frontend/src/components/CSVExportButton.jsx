import React from "react";

function convertToCSV(data) {
  if (!data || !data.length) return '';
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(",")];
  for (const row of data) {
    csvRows.push(keys.map(k => JSON.stringify(row[k] ?? "")).join(","));
  }
  return csvRows.join("\n");
}

const CSVExportButton = ({ data, filename = "export.csv", className = "" }) => {
  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <button onClick={handleExport} className={`px-3 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors ${className}`}>
      Export CSV
    </button>
  );
};

export default CSVExportButton; 