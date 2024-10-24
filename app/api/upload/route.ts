import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the incoming request as a form-data stream (using FormData or Busboy for file handling)
    const form = await request.formData();
    const file = form.get('file') as Blob | null;
    console.log(form)
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
    const fullFileName = `${fileName}.${fileExtension}`;

    // Define the path to store the file in the 'public/uploads' folder
    const filePath = path.join(process.cwd(), 'public/uploads', fullFileName);

    // Create 'uploads' directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'public/uploads'), { recursive: true });

    // Read the file content as an ArrayBuffer and write it to the 'uploads' folder
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Construct the URL for accessing the uploaded file
    const fileUrl = `/uploads/${fullFileName}`;

    return NextResponse.json({
      message: 'File uploaded successfully.',
      fileUrl,
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
