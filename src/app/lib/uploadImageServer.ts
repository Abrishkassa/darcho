import { getSupabaseAdmin } from './supabaseAdmin';

export const PRODUCT_IMAGE_BUCKET = 'product-images';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export class ImageUploadError extends Error {}

/**
 * Upload a product image to Supabase Storage with the service role key and
 * return its public URL.
 *
 * Server-only: callers must have already verified the farmer's session.
 * Throws ImageUploadError with a message that is safe to show the user.
 */
export async function uploadProductImageServer(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError('Please choose a JPG, PNG, WEBP or GIF image.');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError('Image is too large. Maximum size is 5 MB.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await getSupabaseAdmin().storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new ImageUploadError(`Could not upload image: ${uploadError.message}`);
  }

  const { data } = getSupabaseAdmin().storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new ImageUploadError('Upload succeeded but no public URL was returned.');
  }

  return data.publicUrl;
}
