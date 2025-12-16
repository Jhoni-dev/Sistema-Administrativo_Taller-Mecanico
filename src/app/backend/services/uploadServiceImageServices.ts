import { allowedArchivement } from "../utils/allowedArchivement";
import cloudinary from "@/lib/cloudinary";
import { uploadServiceImageRepository } from "../repository/uploadServiceImageRepository";
import isUploadApiResponse from "../utils/validateCloudinary";
import { GetVehicleImages, UpdateServicesImages } from "../types/models/entity";
import uploadCloud from "../utils/uploadImageCloud";
import { formDataToJson } from "../utils/castingFormData";

export async function createImage(id: string, file: File, description: string | undefined): Promise<boolean> {
  if (typeof id != 'string') throw new Error("ID no valido");

  const parseId = Number(id);

  if (isNaN(parseId)) throw new Error("El ID no es numero valido");

  if (allowedArchivement.validationFile(file)) throw new Error("Tipo de archivo no permitido");

  const uploadResult = await uploadCloud(file, 20);

  if (!uploadResult || !isUploadApiResponse(uploadResult)) throw new Error("Ha ocurrido un error inesperado en el almacenamiento de la imagen");

  // 🔧 CORRECCIÓN: Ahora usa upsert internamente, así que funcionará
  // tanto para crear como para reemplazar una imagen existente
  const createSuccess = await uploadServiceImageRepository.create(
    parseId,
    uploadResult.secure_url,
    uploadResult.public_id,
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

  const data = await uploadServiceImageRepository.findById(parseId);

  if (!data) {
    throw new Error("No se econtro la pieza especificada");
  }

  return data;
}

export async function updateImage(id: string, formData: FormData): Promise<boolean> {
  if (!id) throw new Error("Asegurate de digitar el respectivo ID");

  const parseId = Number(id);

  if (isNaN(parseId)) throw new Error("El ID suministrado no cumple con los parametros requeridos");

  const oldData = await uploadServiceImageRepository.findById(parseId);

  if (!oldData) throw new Error("No se ha encontrado el servicio especificado");

  if (!oldData.serviceImage) throw new Error("El servicio especificado no cuenta con una imagen relacionada");

  if (formData.get("image")) {
    const result = await cloudinary.uploader.destroy(oldData.serviceImage.publicId);

    if (!result) throw new Error("No se ha podido eliminar correctamente la imagen anterior");
  }

  const casting: UpdateServicesImages = formDataToJson(formData);

  const filterSuccess = await inputValues(casting);

  if (!filterSuccess) throw new Error("No se establecieron campos permitidos");

  const updateSuccess = await uploadServiceImageRepository.updateById(parseId, filterSuccess);

  if (!updateSuccess) throw new Error("No se ha podido actualizar correctamente el campo especificado");

  return updateSuccess;
}

// 🔧 NUEVO: Función para eliminar imagen
export async function deleteImage(id: string): Promise<boolean> {
  if (!id) throw new Error("ID no proporcionado");

  const parseId = Number(id);

  if (isNaN(parseId)) throw new Error("ID inválido");

  // Obtener datos de la imagen para eliminar de Cloudinary
  const oldData = await uploadServiceImageRepository.findById(parseId);

  if (!oldData || !oldData.serviceImage) {
    throw new Error("No se encontró la imagen");
  }

  // Eliminar de Cloudinary primero
  try {
    await cloudinary.uploader.destroy(oldData.serviceImage.publicId);
  } catch (error) {
    console.error("Error eliminando de Cloudinary:", error);
    // Continuar aunque falle Cloudinary
  }

  // Eliminar de la base de datos
  const deleteSuccess = await uploadServiceImageRepository.deleteById(oldData.serviceImage.id);

  if (!deleteSuccess) throw new Error("No se pudo eliminar la imagen");

  return deleteSuccess;
}

async function inputValues(casting: UpdateServicesImages): Promise<Record<string, any>> {
  const parametersData: Record<string, any> = {};

  if (casting.image) {
    const file: File = casting.image;

    if (allowedArchivement.validationFile(file)) throw new Error("Tipo de archivo no permitido");

    const uploadResult = await uploadCloud(file, 20);

    if (!uploadResult || !isUploadApiResponse(uploadResult)) throw new Error("Ha ocurrido un error inesperado en el almacenamiento de la imagen");

    parametersData["file"] = {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } else if (casting.description) {
    const description: string = casting.description;

    parametersData["description"] = description;
  }

  return parametersData;
}