import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { bookingError } from "./bookingPolicy.js";

export const bookingPhotoRoot = fileURLToPath(new URL("../../storage/booking-photos/", import.meta.url));
export const bookingUpload = multer({ storage: multer.memoryStorage(), limits: { files: 4, fileSize: 5 * 1024 * 1024, fields: 16 } }).array("photos", 4);
export async function saveBookingPhotos(files = []) {
  const validated = files.map(file => {
    const b = file.buffer;
    const png = b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpg = b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255;
    const webp = b.length >= 12 && b.toString("ascii",0,4) === "RIFF" && b.toString("ascii",8,12) === "WEBP";
    const extension = png ? "png" : jpg ? "jpg" : webp ? "webp" : null;
    if (!extension) throw bookingError("Photos must be PNG, JPEG, or WebP images.");
    return { name: `${randomUUID()}.${extension}`, buffer: b };
  });
  const saved = [];
  try {
    if (validated.length) await fs.mkdir(bookingPhotoRoot, { recursive: true });
    for (const file of validated) {
      await fs.writeFile(path.join(bookingPhotoRoot, file.name), file.buffer, { flag: "wx" });
      saved.push(file.name);
    }
    return saved;
  } catch (error) { await removeBookingPhotos(saved); throw error; }
}
export async function removeBookingPhotos(names) {
  await Promise.all(names.map(name => fs.unlink(path.join(bookingPhotoRoot, name)).catch(() => {})));
}
