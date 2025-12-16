import { CreateAppointment } from "../types/models/entity";
import { Prisma } from "@prisma/client";

export function toAppointmentCreateInput(data: CreateAppointment)  {
    const prismaData: Prisma.AppointmentSchedulingCreateInput = {
        appointmentDate: data.appointmentDate as Date,
        ubicacion: data.ubicacion as string,
        ...('details' in data ? {
            details: data.details as string
        } : {}),
        author: {
            connect: {
                id: data.clientId as number
            }
        },
        employedAuthor: {
            connect: {
                id: data.employedId as number
            }
        }
    }

    return prismaData ?? {};
}