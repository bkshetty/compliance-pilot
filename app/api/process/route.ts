import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // <-- We added your database client!

// 1. The JSON Structure
const invoiceSchema = z.object({
  vendorName: z.string().describe("The name of the company or person issuing the invoice"),
  invoiceNumber: z.string().describe("The unique invoice identifier"),
  amount: z.number().describe("The total final amount of the invoice"),
  date: z.string().describe("The date of the invoice in YYYY-MM-DD format"),
  gstin: z.string().optional().describe("The GST identification number if present"),
  taxRate: z.number().optional().describe("The percentage of tax applied, e.g., 18 for 18%"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });

    const imageResponse = await fetch(fileUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 2. Initialize the AI
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0, 
      maxRetries: 2,
    });

    const structuredLlm = llm.withStructuredOutput(invoiceSchema);

    console.log("🤖 AI Agent is analyzing the invoice...");
    const aiData = await structuredLlm.invoke([
      new HumanMessage({
        content: [
          { type: "text", text: "You are an expert financial compliance agent. Carefully analyze this invoice image and extract the required fields. If a field like GSTIN or Tax Rate is completely missing, leave it out." },
          { type: "image_url", image_url: `data:${mimeType};base64,${base64Image}` },
        ],
      }),
    ]);
    
    console.log("✅ Extraction Complete:", aiData);

    // --- NEW: THE COMPLIANCE ENGINE ---
    console.log("🔍 Running Compliance Checks...");
    let complianceStatus = "VALID";
    let risk = "Low";

    if (!aiData.gstin) {
      complianceStatus = "FLAG_INVALID_GST";
      risk = "High";
    } else if (!aiData.taxRate) {
      complianceStatus = "PENDING";
      risk = "Medium";
    }

    // --- NEW: SAVING TO YOUR DATABASE ---
    console.log("💾 Saving to PostgreSQL via Prisma...");
    const savedInvoice = await prisma.invoice.create({
      data: {
        vendorName: aiData.vendorName,
        invoiceNumber: aiData.invoiceNumber,
        amount: aiData.amount,
        date: new Date(aiData.date), // Convert string to proper Date object
        gstin: aiData.gstin,
        taxRate: aiData.taxRate,
        status: complianceStatus,
        riskScore: risk,
      }
    });

    console.log("🎉 Successfully saved to Database!");

    // Return the final data to the UI
    return NextResponse.json({ 
      success: true, 
      data: savedInvoice 
    });

  } catch (error: any) {
    console.error('AI/DB Processing error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}