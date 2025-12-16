import { prisma, Prisma } from "@/lib/prisma";
import { GetServices } from "../types/models/entity";
import { selectFields } from "../utils/filtersRepository";
import { toServiceCreateInput } from "../mappers/serviceMapper";

export const servicesPageRepository = {
    async findMany(): Promise<GetServices[] | null> {
        try {
            return await prisma.services.findMany({
                orderBy: {
                    id: "asc"
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    guarantee: true,
                    createAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    serviceImage: {
                        select: {
                            id: true,
                            imageUrl: true,
                            description: true,
                        }
                    }
                }
            });
        } catch {
            throw new Error("Error en la busqueda de campos");
        }
    },

    async findById(id: number): Promise<GetServices | null> {
        try {
            return await prisma.services.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    guarantee: true,
                    createAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    serviceImage: {
                        select: {
                            id: true,
                            imageUrl: true,
                            description: true,
                        }
                    }
                }
            });
        } catch {
            throw new Error("Error en la busqueda del campo solicitado");
        }
    },

    // Línea donde está el método create
    async create(service: Record<string, unknown>) {  // ← Quitar : Promise<boolean>
        const prismaData = toServiceCreateInput(service);

        try {
            const newService = await prisma.services.create({
                data: prismaData
            });
            return newService; // ← Cambiar de "return newService ? true : false"
        } catch (error) {
            console.log(error)
            throw new Error("Error en la creacion de nuevos campos");
        }
    },

    async update(id: number, data: Record<string, unknown>) {
        const allowedServicesFields = ["name", "description", "price", "guarantee", "serviceCategory_id"];
        const dataServices: Record<string, unknown> = {};

        for (const key in data) {
            if (key === "id") continue;

            if (allowedServicesFields.includes(key)) {
                dataServices[key] = data[key];
            }
        }

        const prismaData: Prisma.ServicesUpdateInput = {
            ...dataServices
        };

        const dataReturn = {
            ...selectFields(dataServices),
            ...('serviceCategory_id' in dataServices
                ? {
                    author: {
                        select: {
                            name: true
                        }
                    }
                }
                : {}),
        }

        try {
            return await prisma.services.update({
                where: { id },
                data: prismaData,
                select: dataReturn
            });
        } catch (error) {
            console.error(error)
            throw new Error("Error en la actualizacion de campos" + error);
        }
    },

    async delete(id: number): Promise<boolean> {
        try {
            const serviceDelete = await prisma.services.delete({
                where: { id }
            });

            return serviceDelete ? true : false;
        } catch {
            throw new Error("Error en la eliminacion de campos");
        }
    }
}