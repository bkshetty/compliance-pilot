import { prisma } from '@/lib/prisma';

// This forces Next.js to fetch fresh data every time you refresh the page
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch all invoices directly from PostgreSQL
  const invoices = await prisma.invoice.findMany({
    orderBy: {
      id: 'desc', // Shows the newest uploads at the top
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-white">Compliance Dashboard</h1>
      
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Vendor</th>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Compliance Status</th>
              <th className="p-4">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium text-white">{inv.vendorName || 'Unknown'}</td>
                <td className="p-4">{inv.invoiceNumber || 'N/A'}</td>
                <td className="p-4 font-mono">₹{inv.amount || 0}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    inv.status === 'VALID' ? 'bg-green-900/50 text-green-400 border border-green-800' : 
                    inv.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' : 
                    'bg-red-900/50 text-red-400 border border-red-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`${
                    inv.riskScore === 'Low' ? 'text-green-400' :
                    inv.riskScore === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  } font-semibold`}>
                    {inv.riskScore}
                  </span>
                </td>
              </tr>
            ))}
            
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
                  No invoices processed yet. Upload one to see it here!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}