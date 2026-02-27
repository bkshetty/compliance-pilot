import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // 1. Get the file from the frontend FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Convert the file to a buffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Create a unique filename so we don't overwrite older invoices
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 4. Upload to the 'invoices' bucket in Supabase Storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    // 5. Get the public URL to send to the AI Vision Agent
    const { data: publicUrlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: publicUrlData.publicUrl, 
      success: true 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}