import { UploadApiResponse } from "cloudinary";

export default function isUploadApiResponse(data: any): data is UploadApiResponse {
  return data && typeof data.secure_url === "string";
}