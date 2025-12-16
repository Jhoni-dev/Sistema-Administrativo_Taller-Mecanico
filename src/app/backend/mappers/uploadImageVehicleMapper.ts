import { Prisma } from '@prisma/client';

export function toVehicleImage_CreateInput(id: number, uploadResult: string, description: string | undefined) {
    const prismaData: Prisma.VehicleImageCreateInput = {
        imageUrl: uploadResult,
        ...(description ? {
            description: description as string
        } : {}),
        checkListAuthor: {
            connect: {
                id: id as number
            }
        }
    }

    return prismaData ?? {};
}