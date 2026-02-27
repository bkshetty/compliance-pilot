"use client";

export default function ExportButton({ invoices }: { invoices: any[] }) {
  const handleExport = () => {
    if (invoices.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Define the CSV Headers
    const headers = ['Database ID', 'Vendor Name', 'Invoice Number', 'Amount (INR)', 'GSTIN', 'Compliance Status', 'Risk Level'];

    // 2. Map the data to rows (wrapping in quotes to prevent commas in vendor names from breaking the columns)
    const csvRows = invoices.map(inv => [
      `"${inv.id}"`,
      `"${inv.vendorName || 'Unknown'}"`,
      `"${inv.invoiceNumber || 'N/A'}"`,
      `"${inv.amount || 0}"`,
      `"${inv.gstin || 'N/A'}"`,
      `"${inv.status}"`,
      `"${inv.riskScore}"`
    ]);

    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    // 4. Create a hidden download link and click it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'compliance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg border border-gray-700 transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      Export to CSV
    </button>
  );
}