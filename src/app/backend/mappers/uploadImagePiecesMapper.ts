import { Prisma } from '@prisma/client';

export function toPiecesImage_CreateInput(id: number, uploadResult: string, publicId: any, description: string | undefined) {
    const prismaData: Prisma.PiecesImagesCreateInput = {
        imageUrl: uploadResult,
        publicId,
        ...(description ? {
            description: description as string
        } : {}),
        piecesAuthor: {
            connect: {
                id: id as number
            }
        }
    }

    return prismaData ?? {};
}