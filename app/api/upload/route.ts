import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json(
        {
          message: "No file provided.",
        },
        {
          status: 400,
        }
      );
    }

    const fileName = form.get('fileName')?.toString() || 'uploaded-file';
    const fileExtension = file.type.split('/').pop();
    const fullFileName = `comprobantes/${fileName}.${fileExtension}`;

    // Convert the Blob to a File or use the Blob directly
    const { error } = await supabase.storage
      .from('payments_refs')
      .upload(fullFileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        {
          message: "Error uploading file to Supabase.",
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl }} = supabase.storage.from('payments_refs').getPublicUrl(fullFileName);

    if (error) {
      return NextResponse.json(
        {
          message: "Error getting public URL.",
          error: error,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      message: 'File uploaded successfully.',
      fileUrl: publicUrl,
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        message: "Server error.",
      },
      {
        status: 500,
      }
    );
  }
}
