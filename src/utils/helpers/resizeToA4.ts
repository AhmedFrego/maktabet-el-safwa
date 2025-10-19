export const resizeToA4 = async (file: File, maxWidth = 1200): Promise<Blob> => {
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

  let quality = 0.9;
  let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );
    if (!blob) throw new Error('Failed to create blob');
    quality -= 0.05;
  } while (blob.size > 200 * 1024 && quality > 0.4);

  return blob;
};
