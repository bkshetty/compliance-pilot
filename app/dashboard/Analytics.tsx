"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Analytics({ invoices }: { invoices: any[] }) {
  // Calculate how many invoices fall into each risk category
  const riskData = [
    { name: 'Low Risk', value: invoices.filter(i => i.riskScore === 'Low').length, color: '#22c55e' }, // Green
    { name: 'Medium Risk', value: invoices.filter(i => i.riskScore === 'Medium').length, color: '#eab308' }, // Yellow
    { name: 'High Risk', value: invoices.filter(i => i.riskScore === 'High').length, color: '#ef4444' }, // Red
  ].filter(d => d.value > 0); // Hide empty categories

  if (invoices.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={riskData} 
            cx="50%" cy="50%" 
            innerRadius={60} outerRadius={80} 
            paddingAngle={5} 
            dataKey="value"
            stroke="none"
          >
            {riskData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} 
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}