import { CreateChecklistItem } from "../types/models/entity";
import { checklistItemRepository } from "../repository/checklistItemRepository";

export const checklistItemService = {
  create: async (input: CreateChecklistItem) => {
    return await checklistItemRepository.create(input);
  },
  
  update: checklistItemRepository.update,
  delete: checklistItemRepository.delete,
};