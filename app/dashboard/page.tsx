import { prisma } from '@/lib/prisma';
import Analytics from './Analytics'; // Import the new chart!
import ExportButton from './ExportButton';
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { id: 'desc' },
  });

  // Calculate top-level metrics for the cards
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const highRiskCount = invoices.filter(inv => inv.riskScore === 'High').length;

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      
      {/* UPDATE THIS HEADER ROW */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Compliance Overview</h1>
        <ExportButton invoices={invoices} /> {/* <-- Drop the button here! */}
      </div>
      
      {/* THE ANALYTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Metric Card 1 */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-center">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Processed</h3>
          <p className="text-4xl font-bold text-white">{invoices.length}</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-center">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Value Checked</h3>
          <p className="text-4xl font-bold text-white font-mono">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        {/* The Chart Card */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg relative">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Risk Distribution</h3>
          {highRiskCount > 0 && (
             <span className="absolute top-6 right-6 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
             </span>
          )}
          <Analytics invoices={invoices} />
        </div>

      </div>

      {/* THE DATA TABLE */}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
            <tr>
              <th className="p-5 font-semibold">Vendor</th>
              <th className="p-5 font-semibold">Invoice #</th>
              <th className="p-5 font-semibold">Amount</th>
              <th className="p-5 font-semibold">Status</th>
              <th className="p-5 font-semibold">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="p-5 font-medium text-white">{inv.vendorName || 'Unknown'}</td>
                <td className="p-5 text-gray-400">{inv.invoiceNumber || 'N/A'}</td>
                <td className="p-5 font-mono text-white">₹{inv.amount?.toLocaleString('en-IN') || 0}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    inv.status === 'VALID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    inv.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-5">
                  <span className={`${
                    inv.riskScore === 'Low' ? 'text-green-400' :
                    inv.riskScore === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  } font-semibold flex items-center gap-2`}>
                    {inv.riskScore === 'High' && '⚠️'} {inv.riskScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}