import { prisma } from "@/lib/prisma";
import { CreateChecklistItem, UpdateChecklistItem } from "../types/models/entity";

export const checklistItemRepository = {
  async create(data: CreateChecklistItem) {
    return await prisma.checklistItem.create({ data });
  },

  async update(id: number, data: Partial<UpdateChecklistItem>) {
    return await prisma.checklistItem.update({
      where: { id },
      data
    });
  },

  async delete(id: number) {
    return await prisma.checklistItem.delete({
      where: { id }
    });
  }
};
