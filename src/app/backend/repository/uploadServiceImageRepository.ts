import { prisma } from '@/lib/prisma';
import { toServiceImage_CreateInput } from '../mappers/uploadImageServiceMapper';
import { GetServiceImages } from '../types/models/entity';

export const uploadServiceImageRepository = {
    async create(id: number, uploadResult: any, publicId: any, description: string | undefined): Promise<boolean> {
        try {
            // 🔧 SOLUCIÓN: Usar upsert con el campo correcto "serviceId" del schema
            const upsertSuccess = await prisma.servicesImages.upsert({
                where: {
                    serviceId: id  // ✅ Campo correcto según schema.prisma línea 164
                },
                update: {
                    // Si existe, actualizar estos campos
                    imageUrl: uploadResult,
                    publicId: publicId,
                    description: description || null
                },
                create: toServiceImage_CreateInput(id, uploadResult, publicId, description)
            });

            return upsertSuccess ? true : false;
        } catch (error) {
            console.log("Error en upsert:", error);
            throw new Error(`Ha ocurrido un error inesperado en la insercion de datos ${error}`);
        }
    },

    async findById(id: number): Promise<GetServiceImages | null> {
        try {
            const createSuccess = await prisma.services.findUnique({
                where: { id },
                select: {
                    serviceImage: {
                        select: {
                            id: true,
                            imageUrl: true,
                            publicId: true,
                            description: true,
                            servicesAuthor: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });

            return createSuccess;
        } catch (error) {
            throw new Error(`Ha ocurrido un error inesperado en la insercion de datos ${error}`);
        }
    },

    async updateById(id: number, data: Record<string, any>): Promise<boolean> {
        try {
            const prismaData = {
                serviceImage: {
                    update: {
                        ...(data.file ? {
                            imageUrl: data.file.imageUrl,
                            publicId: data.file.publicId
                        } : {}),
                        ...(data.description ? {
                            description: data.description
                        } : {})
                    }
                }
            }

            const updateSuccess = await prisma.services.update({
                where: { id },
                data: prismaData
            });

            return updateSuccess ? true : false;
        } catch (error) {
            console.log(error);
            throw new Error("Ha ocurrido un error inesperado en la actualizacion de campos");
        }
    },

    async deleteById(imageId: number): Promise<boolean> {
        try {
            const deleteSuccess = await prisma.servicesImages.delete({
                where: { id: imageId }
            });

            return deleteSuccess ? true : false;
        } catch (error) {
            console.log(error);
            throw new Error("Ha ocurrido un error inesperado al eliminar la imagen");
        }
    }
}