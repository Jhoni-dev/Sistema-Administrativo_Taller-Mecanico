import { Prisma } from '@prisma/client';

export function toServiceCreateInput(data: Record<string, unknown>): Prisma.ServicesCreateInput {
    const prismaData: Prisma.ServicesCreateInput = {
        name: data.name as string,
        price: new Prisma.Decimal(data.price as number),
        author: {
            connect: { id: data.serviceCategory_id as number }
        }
    }

    if (data.description && typeof data.description === "string" && data.description.trim() !== "") {
        prismaData.description = data.description;
    }


    if (data.guarantee && typeof data.guarantee === "string" && data.guarantee.trim() !== "") {
        prismaData.guarantee = data.guarantee;
    }

    return prismaData;
}