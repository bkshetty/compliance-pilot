import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const savedInvoice = await prisma.invoice.create({
      data: {
        vendorName: data.vendorName,
        invoiceNumber: data.invoiceNumber,
        amount: Number(data.amount),
        date: new Date(data.date), 
        gstin: data.gstin || null,
        taxRate: data.taxRate ? Number(data.taxRate) : null,
        status: data.status,
        riskScore: data.riskScore,
      }
    });

    return NextResponse.json({ success: true, data: savedInvoice });
  } catch (error: any) {
    console.error('Database save error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}