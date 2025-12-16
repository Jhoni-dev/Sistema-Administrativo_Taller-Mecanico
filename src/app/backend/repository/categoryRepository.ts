import { prisma, Prisma } from '@/lib/prisma';
import { ModifyCategory, PieceCategory } from '../types/models/entity';
import { selectFields } from '../utils/filtersRepository';

export const categoryRepository = {
    async findMany(): Promise<PieceCategory[]> {
        try {
            return await prisma.pieceCategory.findMany({
                orderBy: {
                  id: "asc" 
                }
            });
        } catch {
            throw new Error("Error en la busqueda de campos");
        }
    },

    async findById(id: number): Promise<PieceCategory | null> {
        try {
            return await prisma.pieceCategory.findUnique({
                where: { id }
            });
        } catch {
            throw new Error("Error en la busqueda del campo solicitado");
        }
    },

    async create(category: ModifyCategory) {
        try {
            return await prisma.pieceCategory.create({
                data: {
                    ...category
                }
            });
        } catch (error) {
            console.log(error)
            throw new Error("Error en la creacion de nuevos campos");
        }
    },

    async update(id: number, data: Prisma.PieceCategoryUpdateInput) {
        const dataReturn = selectFields(data);

        try {
            return await prisma.pieceCategory.update({
                where: { id },
                data,
                select: dataReturn
            });
        } catch {
            throw new Error("Error en la actualizacion de campos");
        }
    },

    async delete(id: number) {
        try {
            return await prisma.pieceCategory.delete({
                where: { id }
            })
        } catch {
            throw new Error("Error en la eliminacion de campos");
        }
    }
}