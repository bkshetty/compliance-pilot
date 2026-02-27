import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Grab variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Safety check: Scream if they are missing
if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 MISSING SUPABASE ENV VARIABLES!");
  throw new Error("Missing Supabase environment variables! Check your .env file.");
}

// 3. Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // 4. Get the file from the frontend FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 5. Convert the file to a buffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Create a unique filename so we don't overwrite older invoices
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 7. Upload to the 'invoices' bucket in Supabase Storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw error;
    }

    // 8. Get the public URL to send to the AI Vision Agent
    const { data: publicUrlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: publicUrlData.publicUrl, 
      success: true 
    });

  } catch (error: any) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}