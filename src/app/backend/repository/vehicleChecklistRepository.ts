import { prisma } from "@/lib/prisma";
import { CreateChecklist, UpdateChecklist } from "../types/models/entity";

export const vehicleChecklistRepository = {
    async create(data: CreateChecklist) {
        return await prisma.vehicleChecklist.create({
            data,
        });
    },

    async findAll() {
        return await prisma.vehicleChecklist.findMany({
            orderBy: {
                id: 'asc'
            },
            include: { items: true, vehicleImage: true }
        });
    },

    async findById(id: number) {
        return await prisma.vehicleChecklist.findUnique({
            where: { id },
            include: { items: true, vehicleImage: true }
        });
    },

    async update(id: number, data: Partial<UpdateChecklist>) {
        return await prisma.vehicleChecklist.update({
            where: { id },
            data
        });
    },

    async delete(id: number) {
        return await prisma.vehicleChecklist.delete({
            where: { id }
        });
    },
};