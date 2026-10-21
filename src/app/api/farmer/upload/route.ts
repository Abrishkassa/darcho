import { NextRequest, NextResponse } from 'next/server';
import { verifyFarmerSession } from '@/app/lib/auth';
import { uploadProductImageServer, ImageUploadError } from '@/app/lib/uploadImageServer';

export const runtime = 'nodejs';

// POST /api/farmer/upload - Upload a product image
export async function POST(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    const url = await uploadProductImageServer(file);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Error uploading product image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
