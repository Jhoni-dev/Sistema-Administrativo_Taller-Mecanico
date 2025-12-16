import { clientVehicleRepository } from "../repository/clientVehicleRepository";
import {
  UpdateVehicle,
  GetVehicleClient,
  CreateVehicle,
} from "../types/models/entity";

export async function getVehicleById(
  id: string,
): Promise<GetVehicleClient | null> {
  const vehicleId = parseInt(id, 10);

  const data = await clientVehicleRepository.findById(vehicleId);

  return data;
}

export async function getAllVehicles(): Promise<GetVehicleClient[] | []> {
  const data = await clientVehicleRepository.findMany();

  return data;
}

export async function createVehicle(data: CreateVehicle) {
  const vehicleCreate = await clientVehicleRepository.create(data);

  return vehicleCreate;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const vehicleId = parseInt(id, 10);

  const vehicleDelete = await clientVehicleRepository.delete(vehicleId);

  return vehicleDelete;
}

export async function updateVehicle(id: string, input: UpdateVehicle) {
  const vehicleId = parseInt(id, 10);

  return await clientVehicleRepository.update(vehicleId, input);
}

