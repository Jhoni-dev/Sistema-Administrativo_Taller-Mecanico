import { allowedArchivement } from "../utils/allowedArchivement";
import cloudinary from "@/lib/cloudinary";
import { uploadImageRepository } from "../repository/uploadImageVehicleRepository";
import isUploadApiResponse from "../utils/validateCloudinary";
import { GetVehicleImages } from "../types/models/entity";
import uploadCloud from "../utils/uploadImageCloud";

export async function createImage(id: string, file: File, description: string | undefined): Promise<boolean> {
  if (typeof id != 'string') throw new Error("ID no valido");

  const parseId = Number(id);

  if (isNaN(parseId)) throw new Error("El ID no es numero valido");

  if (allowedArchivement.validationFile(file)) throw new Error("Tipo de archivo no permitido");

  const uploadResult = await uploadCloud(file, 20);

  if (!uploadResult || !isUploadApiResponse(uploadResult)) throw new Error("Ha ocurrido un error inesperado en el almacenamiento de la imagen");

  const createSuccess = await uploadImageRepository.create(
    parseId,
    uploadResult.secure_url,
    description);

  if (!createSuccess) throw new Error("No se ha podido almacenar la imagen");

  return createSuccess;
}

export async function getImageById(id: string): Promise<GetVehicleImages> {
  if (!id) {
    throw new Error("No se ha suministrado un parametro valido");
  }

  const parseId = Number(id);

  if (isNaN(parseId)) {
    throw new Error("Identificador no valido para la eliminacion de campos");
  }

  const data = await uploadImageRepository.findById(parseId);

  if (!data) {
    throw new Error("No se econtro la pieza especificada");
  }

  return data;
}