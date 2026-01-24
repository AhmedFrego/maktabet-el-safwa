// Maximum file size: 5MB for Supabase storage
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Target size for aggressive compression
const TARGET_SIZE = 150 * 1024;

export const resizeToA4 = async (file: File, maxWidth = 1000): Promise<Blob> => {
  const imageBitmap = await createImageBitmap(file);

  const a4Ratio = 1.414;
  const targetWidth = Math.min(maxWidth, imageBitmap.width);
  const targetHeight = targetWidth * a4Ratio;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const sourceRatio = imageBitmap.width / imageBitmap.height;
  let sx = 0,
    sy = 0,
    sWidth = imageBitmap.width,
    sHeight = imageBitmap.height;

  if (sourceRatio > 1 / a4Ratio) {
    sWidth = imageBitmap.height * (1 / a4Ratio);
    sx = (imageBitmap.width - sWidth) / 2;
  } else {
    sHeight = imageBitmap.width * a4Ratio;
    sy = (imageBitmap.height - sHeight) / 2;
  }

  ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  let quality = 0.85;
  let blob: Blob | null = null;
  let attempts = 0;
  const maxAttempts = 20;

  do {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );
    if (!blob) throw new Error('Failed to create blob');
    quality -= 0.04;
    attempts++;
  } while (blob.size > TARGET_SIZE && quality > 0.1 && attempts < maxAttempts);

  if (!blob || blob.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image file too large (${(blob?.size || 0) / 1024 / 1024}MB). Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Please use a smaller image.`
    );
  }

  return blob;
};
