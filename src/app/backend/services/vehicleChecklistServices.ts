import { CreateChecklist } from "../types/models/entity";
import { vehicleChecklistRepository } from "../repository/vehicleChecklistRepository";

export const vehicleChecklistService = {
  create: async (input: CreateChecklist) => {
    return await vehicleChecklistRepository.create(input);
  },

  list: vehicleChecklistRepository.findAll,
  find: vehicleChecklistRepository.findById,
  update: vehicleChecklistRepository.update,
  delete: vehicleChecklistRepository.delete,
};