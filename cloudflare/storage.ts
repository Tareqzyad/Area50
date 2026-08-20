import { env } from "cloudflare:workers";

export async function uploadStoreImage(input: { fileName: string; contentType: string; base64: string }) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("إعداد رفع الصور غير مكتمل. أضف إعدادات Cloudinary أولاً.");
  }

  const rawBase64 = input.base64.replace(/^data:[^;]+;base64,/, "");
  const estimatedBytes = Math.floor((rawBase64.length * 3) / 4);
  if (estimatedBytes > 5 * 1024 * 1024) {
    throw new Error("حجم الصورة يجب ألا يتجاوز 5MB");
  }

  const dataUrl = `data:${input.contentType};base64,${rawBase64}`;
  const form = new FormData();
  form.set("file", dataUrl);
  form.set("upload_preset", uploadPreset);
  form.set("folder", "area50-store");
  form.set("public_id", `${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const payload = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || "تعذر رفع الصورة");
  }
  return { url: payload.secure_url };
}
