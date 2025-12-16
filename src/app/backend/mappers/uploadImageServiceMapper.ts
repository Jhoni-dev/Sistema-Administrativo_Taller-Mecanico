import { Prisma } from '@prisma/client';

export function toServiceImage_CreateInput(id: number, uploadResult: string, publicId: any, description: string | undefined) {
    const prismaData: Prisma.ServicesImagesCreateInput = {
        imageUrl: uploadResult,
        publicId,
        ...(description ? {
            description: description as string
        } : {}),
        servicesAuthor: {
            connect: {
                id: id as number
            }
        }
    }

    return prismaData ?? {};
}