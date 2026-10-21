export const PRODUCT_IMAGE_BUCKET = 'product-images';

export class ImageUploadError extends Error {}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload a product image and return its public URL.
 *
 * The file is sent to /api/farmer/upload, which verifies the farmer's session
 * server-side and stores it using the service role key. This keeps the storage
 * bucket locked down — the browser never gets write access to it.
 *
 * Throws ImageUploadError with a message that is safe to show the user.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError('Please choose a JPG, PNG, WEBP or GIF image.');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError('Image is too large. Maximum size is 5 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  let res: Response;
  try {
    res = await fetch('/api/farmer/upload', {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new ImageUploadError('Could not reach the server. Check your connection and try again.');
  }

  let data: { success?: boolean; url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. a platform error page)
    throw new ImageUploadError('Upload failed. Please try again.');
  }

  if (!res.ok || !data.success || !data.url) {
    throw new ImageUploadError(data.error || 'Could not upload image. Please try again.');
  }

  return data.url;
}
