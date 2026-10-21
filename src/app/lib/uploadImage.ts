import { supabase } from './supabase';

export const PRODUCT_IMAGE_BUCKET = 'product-images';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export class ImageUploadError extends Error {}

/**
 * Upload a product image to Supabase Storage and return its public URL.
 *
 * Throws ImageUploadError with a message that is safe to show the user.
 * The caller is responsible for catching it and surfacing the message.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError('Please choose a JPG, PNG, WEBP or GIF image.');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError('Image is too large. Maximum size is 5 MB.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new ImageUploadError(
      `Could not upload image: ${uploadError.message}. ` +
        `Make sure a public "${PRODUCT_IMAGE_BUCKET}" bucket exists in Supabase Storage.`
    );
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new ImageUploadError('Upload succeeded but no public URL was returned.');
  }

  return data.publicUrl;
}
