import { Prisma } from '@prisma/client';
import { CreateVehicle } from "../types/models/entity";

export function toClientVehicle_CreateInput(data: CreateVehicle) {
    const prismaData: Prisma.ClientVehicleCreateInput = {
        brand: data.brand as string,
        model: data.model as string,
        year: data.year as number,
        plates: data.plates as string,
        engineDisplacement: data.engineDisplacement as number,
        ...('description' in data ? {
            description: data.description as string
        } : {}),
        ...('clientId' in data ? {
            author: {
                connect: {
                    id: data.clientId as number
                }
            }
        } : {})
    }

    return prismaData ?? {};
}