import { Prisma } from '@prisma/client';

export function toServiceCategory_CreateInput(data: Record<string, unknown>): Prisma.ServiceCategoryCreateInput {
    const prismaData: Prisma.ServiceCategoryCreateInput = {
        name: data.name as string,
    }

    if (data.description && typeof data.description === "string" && data.description.trim() !== "") {
        prismaData.description = data.description;
    }

    return prismaData;
}