import cloudinary from "@/lib/cloudinary";

export default async function uploadCloud(file: File, size: number) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const maxSize = size * 1024 * 1024;

    if (buffer.length > maxSize) throw new Error(`La imagen supera el tamaño máximo permitido (${size}MB)`);

    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tallerMecanico - Service" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });

    return uploadResult;
}