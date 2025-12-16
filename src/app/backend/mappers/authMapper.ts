import { Prisma } from '@prisma/client';

export function toAuthCreateInput(data: Record<string, unknown>): Prisma.SessionCreateInput {
    const prismaData: Prisma.SessionCreateInput = {
        name: data.name as string,
        identificacion: data.identificacion as string,
        email: data.email as string,
        credentials: {
            create: {
                password: data.password as string
            }
        }
    }

    return prismaData;
}