import { prisma } from '@/lib/prisma';
import { GetPiecesImages } from '../types/models/entity';
import { toPiecesImage_CreateInput } from '../mappers/uploadImagePiecesMapper';

export const uploadServiceImageRepository = {
    async create(id: number, uploadResult: any, publicId: any, description: string | undefined): Promise<boolean> {
        try {
            const createSuccess = await prisma.piecesImages.create({
                data: toPiecesImage_CreateInput(id, uploadResult, publicId, description)
            });

            return createSuccess ? true : false;
        } catch (error) {
            console.log(error);
            throw new Error(`Ha ocurrido un error inesperado en la insercion de datos ${error}`);
        }
    },

    async findById(id: number): Promise<GetPiecesImages | null> {
        try {
            const createSuccess = await prisma.pieces.findUnique({
                where: { id },
                select: {
                    piecesImages: {
                        select: {
                            id: true,
                            imageUrl: true,
                            publicId: true,
                            description: true,
                            piecesAuthor: {
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
                piecesImages: {
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

            const updateSuccess = await prisma.pieces.update({
                where: { id },
                data: prismaData
            });

            return updateSuccess ? true : false;
        } catch (error) {
            console.log(error);
            throw new Error("Ha ocurrido un error inesperado en la actualizacion de campos");
        }
    }
}