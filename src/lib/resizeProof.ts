export async function resizeProof(file: File): Promise<{ imageBase64: string; mimeType: string; preview: string }> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a PNG, JPEG or WebP image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Image dimensions are too large. Choose a smaller image.");
    const scale = Math.min(1, 1280 / bitmap.width, 1800 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL("image/jpeg", 0.9);
    return { imageBase64: preview.split(",")[1], mimeType: "image/jpeg", preview };
  } finally { bitmap.close(); }
}
