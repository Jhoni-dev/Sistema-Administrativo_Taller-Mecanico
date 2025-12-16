import { prisma, Prisma } from "@/lib/prisma";
import { GetServiceCategory } from "../types/models/entity";
import { selectFields } from "../utils/filtersRepository";
import { toServiceCategory_CreateInput } from "../mappers/serviceCategoryMapper";

export const serviceCategoryRepository = {
    async findMany(): Promise<GetServiceCategory[] | null> {
        try {
            return await prisma.serviceCategory.findMany({
                orderBy: {
                  id: "asc" 
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createAt: true
                }
            });
        } catch {
            throw new Error("Error en la busqueda de campos");
        }
    },

    async findById(id: number): Promise<GetServiceCategory | null> {
        try {
            return await prisma.serviceCategory.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createAt: true
                }
            });
        } catch {
            throw new Error("Error en la busqueda del campo solicitado");
        }
    },

    async create(service: Record<string, unknown>): Promise<boolean> {
        const prismaData = toServiceCategory_CreateInput(service);

        try {
            const newCategory = await prisma.serviceCategory.create({
                data: prismaData
            });
            return newCategory ? true : false;
        } catch (error) {
            console.log(error)
            throw new Error("Error en la creacion de nuevos campos");
        }
    },

    async update(id: number, data: Record<string, unknown>) {
        const allowedServicesFields = ["name", "description"];
        const dataCategory: Record<string, unknown> = {};

        for (const key in data) {
            if (key === "id") continue;

            if (allowedServicesFields.includes(key)) {
                dataCategory[key] = data[key];
            }
        }

        const prismaData: Prisma.ServiceCategoryUpdateInput = { ...dataCategory };

        const dataReturn = selectFields(dataCategory);

        try {
            return await prisma.serviceCategory.update({
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
            const categoryDelete = await prisma.serviceCategory.delete({
                where: { id }
            });

            return categoryDelete ? true : false;
        } catch {
            throw new Error("Error en la eliminacion de campos");
        }
    }
}