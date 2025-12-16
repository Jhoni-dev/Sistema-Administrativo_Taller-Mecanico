import { prisma } from '@/lib/prisma';
import { toVehicleImage_CreateInput } from '../mappers/uploadImageVehicleMapper';
import { GetVehicleImages } from '../types/models/entity';

export const uploadImageRepository = {
    async create(id: number, uploadResult: any, description: string | undefined): Promise<boolean> {
        try {
            const createSuccess = await prisma.vehicleImage.create({
                data: toVehicleImage_CreateInput(id, uploadResult, description)
            });

            return createSuccess ? true : false;
        } catch (error) {
            throw new Error(`Ha ocurrido un error inesperado en la insercionnn de datos ${error}`);
        }
    },

    async findById(id: number): Promise<GetVehicleImages | null> {
        try {
            const createSuccess = await prisma.vehicleImage.findUnique({
                where: { id },
                select: {
                    id: true,
                    imageUrl: true,
                    description: true,
                    checkListAuthor: {
                        select: {
                            id: true
                        }
                    }
                }
            });

            return createSuccess;
        } catch (error) {
            throw new Error(`Ha ocurrido un error inesperado en la insercion de datos ${error}`);
        }
    },
}