import { ClientVehicle, Prisma } from '@prisma/client';
import { CreateClient } from "../types/models/entity";

export function toClientCreateInput(data: CreateClient) {
    const { clientContact, clientVehicle } = data;

    const recordVehicle = clientVehicle?.map((c) => {
        return ({
            brand: c.brand,
            model: c.model,
            plates: c.plates,
            year: c.year,
            engineDisplacement: c.engineDisplacement,
            ...(!c.description && {
                description: c.description
            })
        }
        );
    });

    const prismaData: Prisma.ClientCreateInput = {
        fullName: data.fullName as string,
        fullSurname: data.fullSurname as string,
        identified: data.identified as string,
        clientContact: {
            create: {
                phoneNumber: clientContact.phoneNumber as string,
                email: clientContact.email as string,
                ...('address' in clientContact ? {
                    address: clientContact.address as string
                } : {})
            }
        },
        ...(clientVehicle && Array.isArray(clientVehicle) ? {
            clientVehicle: {
                create: recordVehicle
            }
        } : {})
    }

    return prismaData ?? {};
}