import { clientRepository } from "../repository/clientRepository";
import { GetClient, CreateClient, UpdateClient } from "../types/models/entity";

export async function getClientById(id: string): Promise<GetClient | null> {
    const clientId = parseInt(id, 10);

    const data = await clientRepository.findById(clientId);

    return data;
}

export async function getAllClient(): Promise<GetClient[] | []> {
    const data = await clientRepository.findMany();

    return data;
}

export async function createClient(data: CreateClient) {
    const clientCreate = await clientRepository.create(data);

    return clientCreate;
}

export async function deleteClient(id: string): Promise<boolean> {
    const clientId = parseInt(id, 10);

    const clientDelete = await clientRepository.delete(clientId);

    return clientDelete;
}

export async function updateClient(id: string, input: UpdateClient) {
    const clientId = parseInt(id, 10);
    
    return await clientRepository.update(clientId, input);
}